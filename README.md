# Social Media App

The REST API remains the primary application. GraphQL is available alongside it at
`POST /graphql` on the configured `PORT` (default `3000`) and uses the same
MongoDB models, authentication tokens, validation, and authorization rules.

For protected GraphQL operations, send the REST login response's access token:

```http
Authorization: Bearer <access_token>
```

GraphQL covers the application capabilities exposed by the REST API: authentication
and account recovery, user profiles, posts and feeds, comments and reactions,
stories, notifications, and the admin dashboard. It uses the same services,
validation, JWT authentication, and role-based authorization as REST. Run
`npm install`, then `npm run build` and `npm start`.

Socket.IO runs on the same HTTP server. Connect with the access token in the
Socket.IO `auth.token` field. The server supports `chat:join`, `chat:send`,
`group:join`, `group:send`, `chat:typing`, and `group:typing`. It emits
`message:new`, `group_message:new`, `notification:new_message`, and
`notification:new_group_message`. REST chat endpoints are available under
`/chats` and `/groups`.
