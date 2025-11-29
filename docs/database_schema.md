
# Database Schema

The Knowle application uses MongoDB as its database, with Mongoose as the Object Data Modeling (ODM) library to define schemas and interact with the data. This document outlines the schema for the core collections.

### Overview

Each Mongoose model corresponds to a collection in the MongoDB database. Schemas define the structure of documents within that collection, including field types, validation, and default values.

---

### User (`user.models.js`)

Stores information about registered users.

```javascript
const userSchema = new Schema({
    username: { type: String, required: true, unique: true, ... },
    email: { type: String, required: true, unique: true, ... },
    fullName: { type: String, required: true, ... },
    avatar: { type: String },
    bio: { type: String, default: '' },
    password: { type: String, required: true },
    topicsToTeach: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    topicsToLearn: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
    points: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    numberOfRatings: { type: Number, default: 0 },
    refreshToken: { type: String },
    ...
}, { timestamps: true });
```

| Field           | Type                                | Description                                                                 | Details                               |
| --------------- | ----------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| `username`      | String                              | The user's unique, public username.                                         | Required, unique, lowercase, indexed. |
| `email`         | String                              | The user's unique email address, used for login.                            | Required, unique, lowercase, indexed. |
| `fullName`      | String                              | The user's full name.                                                       | Required.                             |
| `avatar`        | String                              | URL to the user's profile picture, hosted on Cloudinary.                    | Optional.                             |
| `bio`           | String                              | A short biography or description of the user.                               | Optional.                             |
| `password`      | String                              | The user's hashed password.                                                 | Required.                             |
| `topicsToTeach` | Array of ObjectIds                  | A list of topics the user is proficient in and can teach.                   | References the `Topic` collection.    |
| `topicsToLearn` | Array of ObjectIds                  | A list of topics the user wants to learn.                                   | References the `Topic` collection.    |
| `refreshToken`  | String                              | The JWT refresh token used to issue new access tokens.                      | Stored for session management.        |
| `timestamps`    | Date                                | Automatically adds `createdAt` and `updatedAt` fields.                      | Provided by Mongoose.                 |

---

### Topic (`topic.models.js`)

Stores information about the knowledge topics available on the platform.

```javascript
const topicSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String }
}, { timestamps: true });
```

| Field         | Type   | Description                                           | Details                 |
| ------------- | ------ | ----------------------------------------------------- | ----------------------- |
| `name`        | String | The unique name of the topic (e.g., "React", "Guitar"). | Required, unique.       |
| `category`    | String | A broader category for the topic (e.g., "Programming"). | Required.               |
| `description` | String | A brief description of the topic.                     | Optional.               |

---

### Exchange (`exchange.models.js`)

Represents a knowledge exchange session between two users.

```javascript
const exchangeSchema = new Schema({
    initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicToLearn: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    topicToTeach: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    status: { type: String, enum: ['pending', ...], default: 'pending' },
    initiatorRating: { type: Number, min: 1, max: 5 },
    receiverRating: { type: Number, min: 1, max: 5 },
    ...
}, { timestamps: true });
```

| Field          | Type             | Description                                                   | Details                                |
| -------------- | ---------------- | ------------------------------------------------------------- | -------------------------------------- |
| `initiator`    | ObjectId         | The user who sent the exchange request.                       | Required, references `User`.           |
| `receiver`     | ObjectId         | The user who received the exchange request.                   | Required, references `User`.           |
| `topicToLearn` | ObjectId         | The topic the `initiator` wants to learn from the `receiver`. | Required, references `Topic`.          |
| `topicToTeach` | ObjectId         | The topic the `initiator` will teach in return.               | Required, references `Topic`.          |
| `status`       | String           | The current status of the exchange.                           | Enum, default: `'pending'`.            |
| `...Rating`    | Number           | The rating (1-5) given by a participant after completion.     | Optional.                              |
| `...Review`    | String           | The text review given by a participant after completion.      | Optional.                              |

---

### Message (`message.models.js`)

Represents a single chat message within an exchange.

```javascript
const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    exchange: { type: Schema.Types.ObjectId, ref: 'Exchange', required: true }
}, { timestamps: true });
```

| Field      | Type     | Description                                        | Details                          |
| ---------- | -------- | -------------------------------------------------- | -------------------------------- |
| `sender`   | ObjectId | The user who sent the message.                     | Required, references `User`.     |
| `receiver` | ObjectId | The user who received the message.                 | Required, references `User`.     |
| `content`  | String   | The text content of the message.                   | Required.                        |
| `exchange` | ObjectId | The exchange to which this message belongs.        | Required, references `Exchange`. |