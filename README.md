## Notifications server

### Getting starting

- Clone the repo
- Run `npm install` to install dependencies
- Run `npm run start` to start the server.
- OR `npm run dev` can be used to run a development server (using nodemon)

### Endpoints

[GET] Get notifications

```
/getNotifications?postId=[String eg.1234-5679-1023]
```

[POST] Add notifications

```
/addNotification

body: {
    "type": String - "Like" or "Comment",
    "post": {
        "id": String,
        "title": String
    },
    "user": {
        "id": String,
        "name": String
    }

    (optional - for type = "Comment")
    "comment": {
        "id": String,
        "commentText": String
    },
}
```

[PATCH] Mark as read

```
/markAsRead
body: {
    posts: [
		String,
		String,
		...
	]
}
```

### Testing

Test are written in Postman, and can be imported using the Postman collection found in `postman/Phrasee.postman_collection`
