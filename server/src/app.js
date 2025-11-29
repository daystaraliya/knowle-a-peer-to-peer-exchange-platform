import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';

// SSR is disabled by default in development to avoid server-side JSX parsing
// of client components. Enable by setting ENABLE_SSR=true in the server .env.
const ENABLE_SSR = process.env.ENABLE_SSR === 'true';

const app = express();

// Middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// A special raw body parser for the Stripe webhook
// Must be defined before the general json parser
import { stripeWebhook } from './controllers/payment.controllers.js';
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);


app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public')); // Server's public folder
app.use(cookieParser());

// Routes import
import userRouter from './routes/user.routes.js';
import exchangeRouter from './routes/exchange.routes.js';
import topicRouter from './routes/topic.routes.js';
import projectRouter from './routes/project.routes.js';
import skillTreeRouter from './routes/skillTree.routes.js';
import messageRouter from './routes/message.routes.js';
import notificationRouter from './routes/notification.routes.js';
import achievementRouter from './routes/achievement.routes.js';
import leaderboardRouter from './routes/leaderboard.routes.js';
import forumRouter from './routes/forum.routes.js';
import postRouter from './routes/post.routes.js';
import mentorRouter from './routes/mentor.routes.js';
import paymentRouter from './routes/payment.routes.js';
import recordingRouter from './routes/recording.routes.js';
import assessmentRouter from './routes/assessment.routes.js';
import resourceRouter from './routes/resource.routes.js';
import eventRouter from './routes/event.routes.js';
import featureRequestRouter from './routes/featureRequest.routes.js';
import onboardingRouter from './routes/onboarding.routes.js';
// import sitemapRouter from './routes/sitemap.routes.js'; // New Import for sitemap - TODO: Create this file


// Routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/exchanges', exchangeRouter);
app.use('/api/v1/topics', topicRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/skill-trees', skillTreeRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/achievements', achievementRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);
app.use('/api/v1/forums', forumRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/mentors', mentorRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/recordings', recordingRouter);
app.use('/api/v1/assessment', assessmentRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/feature-requests', featureRequestRouter);
app.use('/api/v1/onboarding', onboardingRouter);
// app.use('/', sitemapRouter); // New Route for sitemap - TODO: Create sitemap.routes.js file


// --- SEO & SSR Configuration ---
const __dirname = path.resolve();
const clientBuildPath = path.resolve(__dirname, '..', 'client', 'dist');

// Serve static assets from the Vite build directory (used when SSR is enabled)
app.use(express.static(clientBuildPath, { index: false }));

// SSR catch-all route to render the React app
app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api/')) {
        return next();
    }

    if (!ENABLE_SSR) {
        // In development, direct users to the Vite dev server
        return res.status(200).send('SSR disabled. Use the client dev server at http://localhost:3000');
    }

    const indexPath = path.resolve(clientBuildPath, 'index.html');

    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        if (err) {
            console.error('Error reading index.html for SSR:', err);
            return res.status(500).send('An error occurred during server rendering.');
        }

        // Render the React app to a string. Note: Context providers that depend on
        // browser APIs are omitted here. The client will hydrate with them.
        const appHtml = ReactDOMServer.renderToString(
            <StaticRouter location={req.url}>
                <App />
            </StaticRouter>
        );

        // Inject the rendered app into our HTML template
        const finalHtml = htmlData.replace(
            '<div id="root"></div>',
            `<div id="root">${appHtml}</div>`
        );

        res.send(finalHtml);
    });
});

export { app };