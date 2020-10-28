import { Input, InputLabel } from "@material-ui/core";
import React, { ChangeEvent, useEffect, useState } from "react";
import "./ImportButton.scss";

export const ImportButton = () => {
  const [file, setFile] = useState<Blob>();

  useEffect(() => {
    // https://stackoverflow.com/questions/5201317/read-the-contents-of-a-file-object
    const read = new FileReader();
    file && read.readAsBinaryString(file);

    read.onloadend = () => {
      // eslint-disable-next-line no-console
      console.log(read.result);
    };
  }, [file]);

  return (
    <InputLabel className="import-label" htmlFor="import-button">
      <Input
        className="hidden"
        id="import-button"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          e.target.files && setFile(e.target.files[0]);
        }}
        type="file"
      />
      Import CSV
    </InputLabel>
  );
};
