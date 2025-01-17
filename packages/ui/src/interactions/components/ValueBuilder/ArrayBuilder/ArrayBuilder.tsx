import React, { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import { ValueBuilder } from "../ValueBuilder";
import classes from "./ArrayBuilder.module.scss";
import { SimpleButton } from "../../../../common/buttons/SimpleButton/SimpleButton";
import { SizedBox } from "../../../../common/misc/SizedBox/SizedBox";
import { FclValueUtils } from "@onflowser/core";

export function ArrayBuilder(props: CadenceValueBuilder): ReactElement {
  const { disabled, type, value, setValue } = props;

  const { array } = type;
  if (array === undefined) {
    throw new Error("Expected array field");
  }

  const isConstantArray = array.size !== -1;
  const isFclArray = FclValueUtils.isFclArrayValue(value);
  const isUninitializedConstantArray =
    isConstantArray && isFclArray && value.length !== array.size;
  const isInitialized = isFclArray && !isUninitializedConstantArray;

  // TODO(polish): Don't trigger this hook on every rerender
  //  See: https://www.notion.so/flowser/Sometimes-arguments-don-t-get-initialized-properly-80c34018155646d08e4da0bc6c977ed9?pvs=4
  useEffect(() => {
    if (!isInitialized) {
      setValue(initFclArrayOfSize(isConstantArray ? array.size : 1));
    }
  });

  function setElement(index: number, element: FclValueUtils) {
    if (isInitialized) {
      value[index] = element;
      setValue(value);
    }
  }

  function increaseSize() {
    if (isInitialized) {
      setValue([...value, undefined]);
    }
  }

  function decreaseSize() {
    if (isInitialized) {
      setValue(value.slice(0, value.length - 1));
    }
  }

  if (!isFclArray) {
    return <></>;
  }

  return (
    <div className={classes.root}>
      {value.map((value, index) => {
        if (array.element === undefined) {
          throw new Error("Expected array element field");
        }
        return (
          <div key={index} className={classes.arrayElement}>
            <code className={classes.indexDisplay}>{index}:</code>
            <ValueBuilder
              disabled={disabled}
              type={array.element}
              value={value}
              setValue={(value) => setElement(index, value)}
            />
          </div>
        );
      })}
      {!isConstantArray && !disabled && (
        <div>
          <SimpleButton onClick={() => increaseSize()}>Add</SimpleButton>
          <SizedBox inline width={10} />
          <SimpleButton onClick={() => decreaseSize()}>Remove</SimpleButton>
        </div>
      )}
    </div>
  );
}

function initFclArrayOfSize(size: number): FclArrayValue {
  return Array.from({ length: size }).map(() => undefined);
}
