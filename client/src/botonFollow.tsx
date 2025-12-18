import { useEffect, useState } from "react";
import type { UserInterface } from "./interfaces/UserInterface";
import axios from "axios";

interface FollowButtonProps {
  user: UserInterface;
  setUser?: React.Dispatch<React.SetStateAction<UserInterface | null>>;
  me: UserInterface;
  setMe: React.Dispatch<React.SetStateAction<UserInterface | null>>;
}

function FollowButton({ user, setUser, me, setMe }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    
    useEffect(() => {
        setIsFollowing(me.following.includes(user._id));
    }, []);

    return (
    <>
        {!isFollowing && (<button className="botonFollow" onClick={async () => {
            try {
                const newFollowing = [...me.following, user._id];
                const newFollowers = [...user.followers, me._id];

                await axios.patch(`http://localhost:3000/users/${user._id}`, { followers: newFollowers });
                await axios.patch(`http://localhost:3000/users/${me._id}`, { following: newFollowing });

                setMe({ ...me, following: newFollowing });
                setUser? setUser({ ...user, followers: newFollowers }):

                setIsFollowing(true);
            } catch (err) {
                console.error(err);
                          }
            }}>
                Seguir
            </button>)}
        {isFollowing && (<button className="botonFollow" onClick={async () => {
                try {
                    const newFollowing = me.following.filter(f => f !== user._id);
                    const newFollowers = user.followers.filter(f => f !== me._id);

                    await axios.patch(`http://localhost:3000/users/${user._id}`, { followers: newFollowers });
                    await axios.patch(`http://localhost:3000/users/${me._id}`, { following: newFollowing });

                    setMe({ ...me, following: newFollowing });
                    setUser? setUser({ ...user, followers: newFollowers }):

                    setIsFollowing(false);
                } catch (err) {
                    console.error(err);
                }
            }}>
                Dejar de seguir
            </button>)}
        </>
    )
}

export default FollowButton;