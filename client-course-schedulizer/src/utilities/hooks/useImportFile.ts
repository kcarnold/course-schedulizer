import { forEach, isEqual } from "lodash";
import { ChangeEvent, useContext } from "react";
import { csvStringToSchedule, insertSectionCourse, Schedule } from "utilities";
import { AppContext } from "utilities/contexts";
import { read, utils } from "xlsx";

/**
 * Hook that returns function to handle file uploaded
 *   and store it in local state.
 *
 * @param  {boolean} isAdditiveImport
 * @returns void
 *
 * Ref: https://stackoverflow.com/questions/5201317/read-the-contents-of-a-file-object
 */
export const useImportFile = (isAdditiveImport: boolean) => {
  const {
    appState: { schedule },
    appDispatch,
    setIsCSVLoading,
  } = useContext(AppContext);

  /**
   * Used to handle changes to inputs when files are uploaded.
   */
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsCSVLoading(true);

    const file: File | null = e.target.files && e.target.files[0];
    const fileNameTokens = file?.name.split(".") || [];
    const fileType = fileNameTokens[fileNameTokens.length - 1];
    const reader = new FileReader();
    let scheduleJSON: Schedule;

    switch (fileType) {
      case "xlsx": {
        file && reader.readAsArrayBuffer(file);
        break;
      }
      case "csv": {
        file && reader.readAsBinaryString(file);
        break;
      }
      case "json": {
        file && reader.readAsText(file);
        break;
      }
      default: {
        throw Error(`FileType ${fileType} not supported.`);
      }
    }

    reader.onloadend = async () => {
      let scheduleString: string;
      if (fileType === "xlsx") {
        scheduleString = getCSVFromXLSXData(reader.result as ArrayBufferLike);
      } else if (fileType === "csv") {
        scheduleString = String(reader.result);
      } else {
        const newConstraints = JSON.parse(String(reader.result));
        if(newConstraints.constraints) {
          newConstraints.constraints.forEach((constraintData: string[]) => {
            constraintData.forEach((course: string) => {
              newConstraints[course] = constraintData.filter((c) => { return c !== course });
            })
          });
          delete newConstraints.constraints;
        }
        appDispatch({ payload: { constraints: newConstraints }, type: "setConstraints" });
        scheduleString = "";
      }
      scheduleJSON = csvStringToSchedule(scheduleString);

      !isAdditiveImport && appDispatch({ payload: { fileUrl: "" }, type: "setFileUrl" });
      await updateScheduleInContext(schedule, scheduleJSON, appDispatch, isAdditiveImport);
      setIsCSVLoading(false);
    };
  };

  return onInputChange;
};

/**
 * Update the Schedule information in the context
 * @param currentSchedule
 * @param newSchedule
 * @param appDispatch
 * @param isAdditiveImport
 *
 * Ref: https://stackoverflow.com/a/57214316/9931154
 */
export const updateScheduleInContext = async (
  // Note these are the parameters, just on different lines
  currentSchedule: Schedule,
  newSchedule: Schedule,
  appDispatch: AppContext["appDispatch"],
  isAdditiveImport = false,
  //
) => {
  if (!isEqual(currentSchedule, newSchedule)) {
    // Changing the new schedule to have higher importRank
    forEach(newSchedule.courses, (course) => {
      course.importRank = currentSchedule.numDistinctSchedules;
    });
    let newScheduleData: Schedule;
    if (isAdditiveImport) {
      newScheduleData = combineSchedules(currentSchedule, newSchedule);
    } else {
      newScheduleData = newSchedule;
    }
    newScheduleData.numDistinctSchedules = currentSchedule.numDistinctSchedules + 1;
    await appDispatch({ payload: { schedule: newScheduleData }, type: "setScheduleData" });
  }
};

/**
 * Convert XLSX Data to CSV
 *
 * @param  {ArrayBufferLike} xlsxData
 * @returns string
 */
export const getCSVFromXLSXData = (xlsxData: ArrayBufferLike): string => {
  const data = new Uint8Array(xlsxData);
  const workBook = read(data, { type: "array" });
  const firstSheet = workBook.Sheets[workBook.SheetNames[0]];
  return utils.sheet_to_csv(firstSheet);
};

/**
 * Combine two schedule courses together.
 *
 * @param  {Schedule} currentSchedule
 * @param  {Schedule} newSchedule
 */
const combineSchedules = (currentSchedule: Schedule, newSchedule: Schedule) => {
  newSchedule.courses.forEach((newCourse) => {
    newCourse.sections.forEach((newSection) => {
      currentSchedule = insertSectionCourse(currentSchedule, newSection, newCourse);
    });
  });
  return currentSchedule;
};
