import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthContext from "../../../hooks/useAuthContext";

import styles from "./index.module.css";
import Loading from "../../ui/loading";
import Card from "../../ui/card";
import FriendWidget from "../widget";

const FriendsList = () => {
  const { user, authedFetch } = useAuthContext();

  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleRequest = async (reqObj, action) => {
    try {
      const res = await authedFetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/${user.id}/friends/${reqObj._id}/handle`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: action }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        if (action === "accept") setFriends((prev) => [...prev, reqObj]);
        setRequests((prev) => prev.filter((req) => req._id !== reqObj._id));
      }
    } catch (err) {
      console.log("Something unexpected occurred.");
    }
  };

  useEffect(() => {
    const getFriendRequests = async () => {
      setLoading(true);
      try {
        const res = await authedFetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/users/${user.id}`
        );
        const data = await res.json();
        setRequests(data.user.friendRequests);
        setFriends(data.user.friends);
      } catch (err) {
        console.log("Something unexpected occurred.");
      }
      setLoading(false);
    };

    if (user) getFriendRequests();
  }, [user]); // eslint-disable-line

  return (
    <Card className={styles.listsContainer}>
      <BasicList
        listName="Friend Requests"
        loading={loading}
        items={requests}
        type="REQUESTS"
        handleRequest={handleRequest}
        userId={user.id}
        limit={3}
      />
      <BasicList
        listName="Friends"
        loading={loading}
        items={friends}
        type="FRIENDS"
        userId={user.id}
        limit={7}
      />
    </Card>
  );
};

export default FriendsList;

const BasicList = ({
  listName,
  loading,
  items,
  type,
  handleRequest,
  userId,
  limit,
}) => {
  return (
    <section className={styles.list}>
      <p className={styles.listName}>{listName}</p>

      {loading && <Loading fullWidth />}
      {!loading && (
        <div className={styles.entryContainer}>
          {items.map((user, idx) => {
            if (idx < limit) {
              return (
                <FriendWidget
                  key={user._id}
                  user={user}
                  type={type}
                  handleRequest={handleRequest}
                />
              );
            } else {
              return undefined;
            }
          })}
          {items.length > limit && (
            <Link to={`/profiles/${userId}/friends`} className={styles.more}>
              See More...
            </Link>
          )}
        </div>
      )}
    </section>
  );
};
