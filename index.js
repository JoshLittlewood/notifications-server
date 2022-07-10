const express = require("express");
const fs = require("fs");
const uuid = require("uuid");

const notifications = require("./notifications.json");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/getNotifications", (req, res) => {
  const postId = req.query.postId;

  // Early return for no postId
  if (!postId) {
    return res
      .status(400)
      .send(
        "No postId was provided. Please provide one in a 'postId' query param"
      );
  }

  const notificationsForPost = [];
  const metadata = {
    commentNotificationsCount: 0,
    likeNotificationsCount: 0,
    totalNotificationsCount: 0,
  };

  // Early return for no notifications
  if (!notifications.length) {
    return res.json({ notifications: notificationsForPost, metadata });
  }

  const addToNotificationCount = (notification) => {
    if (notification?.type === "Like") {
      metadata.likeNotificationsCount += 1;
      metadata.totalNotificationsCount += 1;
    }
    if (notification?.type === "Comment") {
      metadata.commentNotificationsCount += 1;
      metadata.totalNotificationsCount += 1;
    }
  };

  // Get all notificaitons for the given postId
  notifications.forEach((notification) => {
    if (notification.post.id === postId) {
      notificationsForPost.push(notification);
      addToNotificationCount(notification);
    }
  });

  return res.json({ notifications: notificationsForPost, metadata });
});

app.post("/addNotification", (req, res) => {
  const requestData = req.body;

  // Early return for no body
  if (!requestData) {
    return res.status(400).send("No notication provided in post body");
  }

  // Some basic, manual validation.
  // Really need an orm and/or a proper validator here to match schema.
  // Guess that would come with the inevitable db integration :D

  // Validate notification type
  if (requestData?.type !== "Like" && requestData?.type !== "Comment") {
    return res.status(400).send("Notification 'type' did not match validation");
  }

  // Validate notification post
  if (
    typeof requestData?.post?.id !== "string" ||
    typeof requestData?.post?.title !== "string"
  ) {
    return res.status(400).send("Notification 'post' did not match validation");
  }

  // Validate notification user
  if (
    typeof requestData?.user?.id !== "string" ||
    typeof requestData?.user?.name !== "string"
  ) {
    return res.status(400).send("Notification 'user' did not match validation");
  }

  // Validate notification comment (if it's a comment)
  if (
    requestData.type === "Comment" &&
    (typeof requestData?.comment?.id !== "string" ||
      typeof requestData?.comment?.commentText !== "string")
  ) {
    return res
      .status(400)
      .send("Notification 'comment' did not match validation");
  }

  const notificationToAdd = {
    ...requestData,
    read: false,
    id: uuid.v4(),
  };

  // Write to file with old notifications, plus the new one.
  fs.writeFileSync(
    "notifications.json",
    JSON.stringify([...notifications, notificationToAdd]),
    []
  );

  return res.status(201).send("Notification successfully added");
});

app.patch("/markAsRead", (req, res) => {
  const readPostIds = req.body?.posts;

  // Early return for no body
  if (!readPostIds || !readPostIds.length) {
    return res.status(400).send("No post ids provided in patch body");
  }

  // Would be intereted to speed test this approach of finding indexes then updating those
  // vs, forEach'ing the whole notifications file and updaing in the same operation.
  const indexesToUpdate = [];
  readPostIds.forEach((id) => {
    let notificationIndex = notifications.findIndex((item) => item.id === id);
    indexesToUpdate.push(notificationIndex);
  });

  if (indexesToUpdate.includes(-1)) {
    return res
      .status(400)
      .send("1 or more of the notification ids provided could not be found");
  }

  // Mark as read
  indexesToUpdate.forEach((index) => {
    notifications[index].read = true;
  });

  // Write to file with old notifications, plus the new one.
  fs.writeFileSync(
    "notifications.json",
    JSON.stringify([...notifications]),
    []
  );

  return res.status(204).send();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
