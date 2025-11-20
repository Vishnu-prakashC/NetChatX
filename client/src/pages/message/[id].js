import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getDataAPI } from "../../utils/fetchData";
import { addUser } from "../../redux/actions/messageAction";
import LeftSide from "../../components/message/LeftSide";
import RightSide from "../../components/message/RightSide";

const Conversation = () => {
  const { id } = useParams();
  const { auth, message } = useSelector(state => state);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAndAddUser = async () => {
      if (id && auth.token) {
        console.log('Conversation page mounted for id:', id, 'auth user:', auth.user._id);
        try {
          // Check if user is already in conversation list
          const userExists = message.users.some(user => user._id === id);

          // If user isn't present, add a lightweight placeholder immediately
          if (!userExists) {
            console.log('No user in message.users for id, adding placeholder:', id);
            const placeholder = { _id: id, username: '', fullname: '', avatar: '' };
            dispatch(addUser({ user: placeholder, message }));

            // Fetch full user data and replace placeholder if available
            try {
              const res = await getDataAPI(`user/${id}`, auth.token);
              if (res.data.user) {
                console.log('Fetched full user for conversation id:', id, res.data.user.username);
                dispatch(addUser({ user: res.data.user, message }));
              }
            } catch (fetchErr) {
              console.error('Error fetching user for conversation:', fetchErr);
            }
          }
        } catch (error) {
          console.error('Unhandled error in fetchAndAddUser:', error);
        }
      }
    };

    fetchAndAddUser();
  }, [id, auth.token, message, dispatch]);

  return (
    <div className="whatsapp-messenger">
      <div className="messenger-sidebar">
        <LeftSide />
      </div>

      <div className="messenger-chat-area">
        <RightSide /> 
      </div>
    </div>
  );
};

export default Conversation;
