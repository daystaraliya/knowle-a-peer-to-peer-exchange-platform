import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { MentorshipOffering } from "../models/mentorshipOffering.models.js";
import { Purchase } from "../models/purchase.models.js";
import { stripe } from "../utils/stripe.js";

const createCheckoutSession = asyncHandler(async (req, res) => {
    const { type, priceId } = req.body; // type: 'subscription' or 'mentorship'
    const userId = req.user._id;

    let user = await User.findById(userId);
    let stripeCustomerId = user.premium.stripeCustomerId;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.fullName,
            metadata: {
                userId: user._id.toString(),
            },
        });
        stripeCustomerId = customer.id;
        user.premium.stripeCustomerId = stripeCustomerId;
        await user.save();
    }

    const sessionConfig = {
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        success_url: `${process.env.CLIENT_URL}/payment-success`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
        metadata: {
            userId: userId.toString(),
        },
    };

    if (type === 'subscription') {
        sessionConfig.line_items = [{
            price: process.env.STRIPE_PREMIUM_PRICE_ID,
            quantity: 1,
        }];
        sessionConfig.mode = 'subscription';
        sessionConfig.metadata.type = 'subscription';
    } else if (type === 'mentorship') {
        const offering = await MentorshipOffering.findById(priceId);
        if (!offering) throw new ApiError(404, "Mentorship offering not found.");
        
        sessionConfig.line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: offering.title,
                    description: offering.description,
                },
                unit_amount: offering.price,
            },
            quantity: 1,
        }];
        sessionConfig.mode = 'payment';
        sessionConfig.metadata.type = 'mentorship';
        sessionConfig.metadata.offeringId = offering._id.toString();
    } else {
        throw new ApiError(400, "Invalid purchase type.");
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json(new ApiResponse(200, { sessionId: session.id }, "Checkout session created."));
});


const stripeWebhook = asyncHandler(async (req, res) => {
    // IMPORTANT: This webhook handler requires the raw request body.
    // In your Express app, you must configure the route for this webhook
    // to use express.raw({type: 'application/json'}) BEFORE any other body-parsing middleware.
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const { userId, type, offeringId } = session.metadata;

            if (type === 'subscription') {
                await User.findByIdAndUpdate(userId, {
                    'premium.subscriptionId': session.subscription,
                    'premium.subscriptionStatus': 'active',
                });
            } else if (type === 'mentorship') {
                await Purchase.create({
                    user: userId,
                    item: offeringId,
                    itemType: 'mentorship',
                    amount: session.amount_total,
                    stripePaymentId: session.payment_intent,
                });
            }
            break;
        
        case 'customer.subscription.deleted':
        case 'customer.subscription.updated':
             const subscription = event.data.object;
             await User.findOneAndUpdate(
                { 'premium.subscriptionId': subscription.id },
                { 'premium.subscriptionStatus': subscription.status }
            );
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
});

export { createCheckoutSession, stripeWebhook };