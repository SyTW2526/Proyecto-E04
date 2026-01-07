import { useEffect, useState } from "react";
import type { UserInterface } from "../interfaces/UserInterface";
import axios from "axios";
import { Bookmark, BookmarkCheck } from "lucide-react";

/**
 * SaveButtonProps. Información necesaria para el botón de guardado.
 */
interface SaveButtonProps {
    user: UserInterface;
    setUser: React.Dispatch<React.SetStateAction<UserInterface | null>>;
    id: string;
}

const port = import.meta.env.VITE_PORT ?? 3000;

/**
 * SaveButton. Renderiza un botón para guardar o dejar de guardar una receta.
 * @param param0 Usuario user (el que ha iniciado sesión) y función setUser para modificarlo y añadirlo a su lista de guardados. id es el ID de la receta a guardar o dejar de guardar.
 * @returns Botón renderizado.
 */
function SaveButton({ user, setUser, id }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState<boolean>(false);
    useEffect(() => {
        setIsSaved(user.saved.includes(id));
    }, []);
    
    return (
        <>
            {!isSaved && (
            <button className="post-save-button-inner" aria-label="Dejar de guardar receta" onClick={async () => {
            try {
                const newSaved = [...user.saved, id];

                const response = await axios.patch(`http://localhost:${port}/users/` + user._id, { saved: newSaved });
                console.log(response);

                setUser({ ...user, saved: newSaved });

                setIsSaved(true);
            } catch (error) {
                console.error(error);
            }
          }}>
            <Bookmark size={30} />
          </button>)}
          {isSaved && (
            <button className="post-save-button-inner" aria-label="Dejar de guardar receta" onClick={async () => {
            try {
                const newSaved = user.saved.filter(f => f !== id);

                const response = await axios.patch(`http://localhost:${port}/users/` + user._id, { saved: newSaved });
                console.log(response);

                setUser({ ...user, saved: newSaved });

                setIsSaved(false);
            } catch (error) {
                console.error(error);
            }
          }}>
            <BookmarkCheck size={30} />
          </button>)}
        </>
    );
}

export default SaveButton;