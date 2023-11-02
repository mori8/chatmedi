"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import classNames from "classnames";

import ModelIconWithModal from "./ModelIconWithModal";
import { hash } from "../../utils/utils";

export default function ModuleGroupBox({
  messageId,
  moduleName,
  models,
  summary,
}: Module) {
  return (
    <div className="flex flex-row gap-6">
      <div className="min-w-[6rem] font-bold">{moduleName}</div>
      <div className="flex flex-wrap min-w-[8rem] content-start relative">
        {models.map((model) => {
          return (
            <ModelIconWithModal {...model} key={model.name} />
          );
        })}
      </div>
      <div>{summary}</div>
    </div>
  );
}
