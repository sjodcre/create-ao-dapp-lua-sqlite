import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { LUASQLITE } from "../constants/lua-sqlite_process";

type Book = {
  Id: number;
  Title: string;
  Author: string;
};

export default function DeleteBook({ book }: { book: Book }) {
  const queryClient = useQueryClient();

  const deleteBook = useMutation({
    mutationKey: ["Delete-Book"],
    mutationFn: async ({ Id }: { Id: number }) => {
      const messageId = await message({
        process: LUASQLITE,
        tags: [
          {
            name: "Action",
            value: "Delete-Book",
          },
        ],
        data: JSON.stringify({ Id }),
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
      queryClient.invalidateQueries();
    },
  });

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <button
        type="button"
        disabled={deleteBook.isPending}
        onClick={() => deleteBook.mutateAsync({ Id: book.Id })}
      >
        delete
      </button>
    </div>
  );
}
