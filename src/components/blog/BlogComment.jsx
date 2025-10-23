import React from "react";
import moment from "moment-timezone";
import DefaultAvatar from "../../assets/images/defaultAvatar.svg"
const BlogComment = ({
  commentId,
  userPic,
  firstName,
  lastName,
  content,
  createdAt,
}) => {
  const userTimezone = moment.tz.guess();
  const localMoment = moment.utc(createdAt).tz(userTimezone);

  const now = moment.tz(userTimezone);
  const isToday = localMoment.isSame(now, "day");
  const isYesterday = localMoment.isSame(now.clone().subtract(1, "day"), "day");

  let displayTime;

  if (isToday) {
    displayTime = localMoment.fromNow();
  } else if (isYesterday) {
    displayTime = `Yesterday, ${localMoment.format("hh:mm A")}`;
  } else {
    displayTime = localMoment.format("MMM DD, YYYY hh:mm A");
  }

  return (
    <section>
      <section className="flex flex-row gap-4">
        <div className="w-12 h-12">
          <img
            src={userPic || DefaultAvatar}
            alt={firstName}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="flex-1">
          <div className="flex gap-2 items-center">
            <span className="text-primary font-avenir-black">
              {firstName} {lastName}
            </span>
            <span className="text-xss text-gray-500">{displayTime}</span>
          </div>
          <p>{content}</p>
        </div>
      </section>
    </section>
  );
};

export default BlogComment;
