import React, { FunctionComponent, useEffect } from "react";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import { useSearch } from "../../../hooks/use-search";
import classes from "./Details.module.scss";
import Value from "../../../components/value/Value";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import CopyButton from "../../../components/copy-button/CopyButton";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../components/details-tabs/DetailsTabs";
import { NavLink, useParams } from "react-router-dom";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import Fragment from "../../../components/fragment/Fragment";
import {
  useGetAccount,
  useGetPollingContractsByAccount,
  useGetPollingKeysByAccount,
  useGetPollingStorageByAccount,
  useGetPollingTransactionsByAccount,
} from "../../../hooks/use-api";
import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";
import {
  AccountContract,
  AccountKey,
  AccountStorageItem,
} from "@flowser/shared";
import { FlowUtils } from "../../../utils/flow-utils";
import Table from "../../../components/table/Table";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import Badge from "../../../components/badge/Badge";

type RouteParams = {
  accountId: string;
};

// STORAGE TABLE
const columnHelperStorage =
  createColumnHelper<DecoratedPollingEntity<AccountStorageItem>>();

const columnsStorage = [
  columnHelperStorage.accessor("pathDomain", {
    header: () => <Label variant="medium">DOMAIN</Label>,
    cell: (info) => (
      <Value>{FlowUtils.getLowerCasedPathDomain(info.getValue())}</Value>
    ),
  }),
  columnHelperStorage.accessor("pathIdentifier", {
    header: () => (
      <div className={classes.storageTable}>
        <Label variant="medium">IDENTIFIER</Label>
      </div>
    ),
    cell: (info) => (
      <div className={classes.storageTable}>
        <Value>{info.getValue()}</Value>
      </div>
    ),
  }),
  columnHelperStorage.accessor("data", {
    header: () => (
      <div className={classes.storageTable}>
        <Label variant="medium">DATA</Label>
      </div>
    ),
    cell: (info) => (
      <div className={classes.storageTable}>
        <Value>
          <pre style={{ whiteSpace: "nowrap" }}>
            {JSON.stringify(info.getValue()) ?? "-"}
          </pre>
        </Value>
      </div>
    ),
  }),
];

// CONTRACTS TABLE
const columnHelperContracts =
  createColumnHelper<DecoratedPollingEntity<AccountContract>>();

const columnsContract = [
  columnHelperContracts.accessor("name", {
    header: () => <Label variant="medium">NAME</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/contracts/details/${info.row.original.id}`}>
          {info.row.original.name}
        </NavLink>
      </Value>
    ),
  }),
  columnHelperContracts.accessor("accountAddress", {
    header: () => <Label variant="medium">ACCOUNT</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          {info.getValue()}
        </NavLink>
      </Value>
    ),
  }),
];

// KEYS TABLE
const columnHelperKeys =
  createColumnHelper<DecoratedPollingEntity<AccountKey>>();

const columnsKeys = [
  columnHelperKeys.accessor("accountAddress", {
    header: () => <Label variant="medium">KEY</Label>,
    cell: (info) => (
      <div className={classes.keysRoot}>
        <div className={classes.row}>
          <Ellipsis className={classes.hash}>
            {info.row.original.publicKey}
          </Ellipsis>
          <CopyButton value={info.row.original.publicKey} />
        </div>
        <div className={`${classes.badges} ${classes.row}`}>
          <Badge>WEIGHT: {info.row.original.weight}</Badge>
          <Badge>SEQ. NUMBER: {info.row.original.sequenceNumber}</Badge>
          <Badge>INDEX: {info.row.original.index}</Badge>
          <Badge>
            SIGN CURVE:{" "}
            {FlowUtils.getSignatureAlgoName(info.row.original.signAlgo)}
          </Badge>
          <Badge>
            HASH ALGO.: {FlowUtils.getHashAlgoName(info.row.original.hashAlgo)}
          </Badge>
          <Badge>REVOKED: {info.row.original.revoked ? "YES" : "NO"}</Badge>
        </div>
      </div>
    ),
  }),
];

const Details: FunctionComponent = () => {
  const { accountId } = useParams<RouteParams>();
  const { updateSearchBar } = useSearch();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, isLoading } = useGetAccount(accountId);
  const { data: transactions } = useGetPollingTransactionsByAccount(accountId);
  const { data: contracts } = useGetPollingContractsByAccount(accountId);
  const { data: storageItems } = useGetPollingStorageByAccount(accountId);
  const { data: keys } = useGetPollingKeysByAccount(accountId);
  const { account } = data ?? {};

  const breadcrumbs: Breadcrumb[] = [
    { to: "/accounts", label: "Accounts" },
    { label: "Details" },
  ];

  useEffect(() => {
    showNavigationDrawer(true);
    showSubNavigation(false);
    setBreadcrumbs(breadcrumbs);
  }, []);

  if (isLoading || !account) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.firstRow}>
        <Label variant="large">ADDRESS</Label>
        <Value variant="large">{account.address}</Value>
        <CopyButton value={account.address} />
      </div>
      <Card className={classes.bigCard}>
        <div>
          <Label variant="large" className={classes.label}>
            BALANCE
          </Label>
          <Value variant="large">{account.balance} FLOW</Value>
        </div>
      </Card>
      <DetailsTabs>
        <DetailsTabItem
          label="CONTRACTS"
          value={contracts.length}
          onClick={() =>
            updateSearchBar("search for contracts", !contracts.length)
          }
        >
          <Table<DecoratedPollingEntity<AccountContract>>
            columns={columnsContract}
            data={contracts}
          />
        </DetailsTabItem>
        <DetailsTabItem label="KEYS" value={keys.length}>
          <Fragment
            onMount={() => updateSearchBar("search for keys", !keys.length)}
          >
            <Table<DecoratedPollingEntity<AccountKey>>
              columns={columnsKeys}
              data={keys}
            />
          </Fragment>
        </DetailsTabItem>
        <DetailsTabItem label="STORAGE" value={account.storage?.length}>
          <Table<DecoratedPollingEntity<AccountStorageItem>>
            data={storageItems}
            columns={columnsStorage}
          />
        </DetailsTabItem>
        {!!account.code && (
          <DetailsTabItem label="SCRIPTS" value="<>">
            <Fragment
              onMount={() => updateSearchBar("search for scripts", true)}
            >
              <ContentDetailsScript script={account.code} />
            </Fragment>
          </DetailsTabItem>
        )}
      </DetailsTabs>
    </div>
  );
};

export default Details;
