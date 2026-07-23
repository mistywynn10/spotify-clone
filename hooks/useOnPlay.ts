import { Song } from "@/types";
import usePlayer from "./usePlayer";
import useAuthModal from "./useAuthModal";
import useSubscribeModal from "./useSubscribeModal";
import { useUser } from "./useUser";
import { useCallback } from "react";

const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const authModal = useAuthModal();
  const subscribeModal = useSubscribeModal();

  const { user, subscription, isLoading } = useUser();

  const onPlay = useCallback(
    (id: string) => {
      console.log("Play clicked:", {
        isLoading,
        user: user?.id,
        subscription,
      });

      if (isLoading) {
        return;
      }

      if (!user) {
        authModal.onOpen();
        return;
      }

      if (!subscription) {
        subscribeModal.onOpen();
        return;
      }

      player.setId(id);
      player.setIds(songs.map((song) => song.id));
    },
    [
      isLoading,
      user,
      subscription,
      songs,
      player,
      authModal,
      subscribeModal,
    ],
  );

  return onPlay;
};

export default useOnPlay;