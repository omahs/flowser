import { createColumnHelper } from "@tanstack/table-core";
import { SignableObject } from "@flowser/shared";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { NavLink } from "react-router-dom";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import classes from "./Details.module.scss";
import React, { ReactElement } from "react";
import Table from "../../../components/table/Table";

const columnsHelper = createColumnHelper<SignableObject>();

const columns = [
  columnsHelper.accessor("address", {
    header: () => <Label variant="medium">ACCOUNT ADDRESS</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          {info.getValue()}
        </NavLink>
      </Value>
    ),
  }),
  columnsHelper.accessor("signature", {
    header: () => <Label variant="medium">SIGNATURE</Label>,
    cell: (info) => (
      <Value>
        <MiddleEllipsis className={classes.hash}>
          {info.getValue()}
        </MiddleEllipsis>
      </Value>
    ),
  }),
  columnsHelper.accessor("keyId", {
    header: () => <Label variant="medium">KEY ID</Label>,
    cell: (info) => <Value>{info.getValue()}</Value>,
  }),
];

type SignaturesTableProps = {
  signatures: SignableObject[];
};

export function SignaturesTable(props: SignaturesTableProps): ReactElement {
  return <Table<SignableObject> data={props.signatures} columns={columns} />;
}