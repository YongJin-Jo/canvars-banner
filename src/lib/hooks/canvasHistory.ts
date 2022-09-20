import { useState } from "react";
import { ElementsList,setState,Void } from "../../types/canvarsDefine";


export const useHistory = (
  initalValue: any
): [ElementsList, setState, Void, Void] => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<ElementsList[]>([initalValue]);
  const setState = (
    action: ElementsList | ((prevState: ElementsList) => ElementsList),
    overwirte = false
  ) => {
    const newState =
      typeof action === 'function' ? action(history[index]) : action;
    if (overwirte) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex(prevIndex => prevIndex + 1);
    }
  };

  const undo = () => index > 0 && setIndex(prevState => prevState - 1);
  const redo = () =>
    index < history.length - 1 && setIndex(prevState => prevState + 1);

  return [history[index], setState, undo, redo];
};
