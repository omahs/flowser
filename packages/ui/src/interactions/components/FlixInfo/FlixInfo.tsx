import {
  FLIX_TEMPLATE_NOT_FOUND,
  FlixAuditor,
  FLOW_FLIX_URL,
  useFlixSearch,
  useFlixTemplateAuditors
} from "../../../hooks/flix";
import { Shimmer } from "../../../common/loaders/Shimmer/Shimmer";
import classes from "./FlixInfo.module.scss";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import React, { Fragment } from "react";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { LineSeparator } from "../../../common/misc/LineSeparator/LineSeparator";
import { InteractionDefinition } from "../../core/core-types";

type FlixInfoProps = {
  interaction: InteractionDefinition
}

export function FlixInfo(props: FlixInfoProps) {
  const { data } = useFlixSearch({
    interaction: props.interaction,
    network: "any"
  });

  if (data === undefined) {
    return <Shimmer height={150} />;
  }

  const isVerified = data !== FLIX_TEMPLATE_NOT_FOUND;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <ExternalLink className={classes.title} inline href="https://developers.flow.com/build/advanced-concepts/flix">
          FLIX:
        </ExternalLink>
        {isVerified ? (
          <Fragment>
            verified
            <FlowserIcon.VerifiedCheck className={classes.verifiedIcon} />
          </Fragment>
        ) : (
          <Fragment>
            unverified
            <FlowserIcon.CircleCross className={classes.unverifiedIcon} />
          </Fragment>
        )}
      </div>
      <LineSeparator horizontal />
      <div className={classes.body}>
        {isVerified ? (
          <Fragment>
            <AuditInfo templateId={data.id} />
            <p>{data.data.messages.description?.i18n["en-US"]}</p>
            <ExternalLink inline href={`${FLOW_FLIX_URL}/v1/templates/${data.id}`} />
          </Fragment>
        ) : (
          <Fragment>
            <p>
              This interaction is not yet verified by FLIX.
            </p>
            <ExternalLink
              inline
              href="https://github.com/onflow/flow-interaction-template-service#-propose-interaction-template"
            >
              Submit for verification
            </ExternalLink>
          </Fragment>
        )}
      </div>
    </div>
  );
}

function AuditInfo(props: {templateId: string}) {
  const {data} = useFlixTemplateAuditors({
    templateId: props.templateId,
    // Use mainnet for now, as mainnet likely has the most audits.
    network: "mainnet"
  });

  if (!data) {
    return <Shimmer height={50} />;
  }

  if (data.length === 0) {
    // FLIX templates are treated as being more trustworthy/verified,
    // even if no official audits were performed.
    // For now just ignore the case where no audits exist.
    return null;
  }

  return (
    <div>
      Audited by:
      {data.map((auditor) =>
        <ExternalLink href={auditor.twitter_url} inline>
          {auditor.name}
        </ExternalLink>
      )}
    </div>
  )
}
