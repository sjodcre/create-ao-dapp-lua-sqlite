import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { LUASQLITE } from "../constants/lua-sqlite_process";

export default function AddBook() {
  const queryClient = useQueryClient();
  const [Title, setTitle] = React.useState("");
  const [Author, setAuthor] = React.useState("");

  const addBook = useMutation({
    mutationKey: ["Add-Book"],
    mutationFn: async ({
      Title,
      Author,
    }: {
      Title: string;
      Author: string;
    }) => {
      const messageId = await message({
        process: LUASQLITE,
        tags: [
          {
            name: "Action",
            value: "Add-Book",
          },
        ],
        data: JSON.stringify({ Title, Author }),
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const messageResult = await result({
        process: LUASQLITE,
        message: messageId,
      });

      if (messageResult.Messages[0].Data) {
        return JSON.parse(messageResult.Messages[0].Data);
      }

      return undefined;
    },
    onSuccess: () => {
      setTitle("");
      setAuthor("");
      queryClient.invalidateQueries();
    },
  });

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <input
        type="text"
        placeholder="Book Title"
        value={Title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Author"
        value={Author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <button
        type="button"
        disabled={addBook.isPending}
        onClick={() => addBook.mutateAsync({ Title, Author })}
      >
        Add
      </button>
    </div>
  );
}
