import { IconButton, Tooltip } from "@material-ui/core";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import React from "react";
import { useFieldArrayFormContext } from "utilities";

interface DeleteFieldButtonProps {
  index: number;
}

/**
 * Deletes a row in the field array at a specific index.
 */
export const DeleteFieldButton = ({ index }: DeleteFieldButtonProps) => {
  const { remove } = useFieldArrayFormContext();

  return (
    <div>
      <Tooltip title="Remove">
        <IconButton
          aria-label="remove"
          onClick={() => {
            remove(index);
          }}
        >
          <HighlightOffIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};
