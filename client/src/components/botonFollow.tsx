import { useEffect, useState } from "react";
import type { UserInterface } from "../interfaces/UserInterface";
import axios from "axios";

/**
 * FollowButtonProps. Información necesaria para el botón de seguir.
 */
interface FollowButtonProps {
  user: UserInterface;
  setUser?: React.Dispatch<React.SetStateAction<UserInterface | null>>;
  me: UserInterface;
  setMe: React.Dispatch<React.SetStateAction<UserInterface | null>>;
}

const port = import.meta.env.VITE_PORT ?? 3000;

/**
 * FollowButton. Renderiza un botón que permite seguir o dejar de seguir al usuario user por parte del usuario que ha iniciado sesión (me).
 * @param param0 Usuarios user y me y función setUser y setMe para modificarlos al seguir o dejar de seguir. 
 * @returns Botón renderizado.
 */
function FollowButton({ user, setUser, me, setMe }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    
    useEffect(() => {
        setIsFollowing(me.following.includes(user._id));
    }, [me.following, user._id]);

    return (
    <>
        {!isFollowing && (<button className="botonFollow" onClick={async () => {
            try {
                const newFollowing = [...me.following, user._id];
                const newFollowers = [...user.followers, me._id];

                await axios.patch(`http://localhost:${port}/users/${user._id}`, { followers: newFollowers });
                await axios.patch(`http://localhost:${port}/users/${me._id}`, { following: newFollowing });

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

                    await axios.patch(`http://localhost:${port}/users/${user._id}`, { followers: newFollowers });
                    await axios.patch(`http://localhost:${port}/users/${me._id}`, { following: newFollowing });

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