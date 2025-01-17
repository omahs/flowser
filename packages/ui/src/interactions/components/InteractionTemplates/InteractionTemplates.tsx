import React, { ReactElement, useMemo, useState } from "react";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import classes from "./InteractionTemplates.module.scss";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { SearchInput } from "../../../common/inputs";
import { useConfirmDialog } from "../../../contexts/confirm-dialog.context";
import classNames from "classnames";
import { InteractionLabel } from "../InteractionLabel/InteractionLabel";
import { InteractionSourceType, useTemplatesRegistry } from "../../contexts/templates.context";
import { IdeLink } from "../../../common/links/IdeLink";
import { WorkspaceTemplate } from "@onflowser/api";
import { FlixInfo } from "../FlixInfo/FlixInfo";
import { BaseBadge } from "../../../common/misc/BaseBadge/BaseBadge";
import { useLocalStorage } from "@uidotdev/usehooks";

export function InteractionTemplates(): ReactElement {
  return (
    <div className={classes.root}>
      <StoredTemplates />
      <FocusedInteraction />
    </div>
  );
}

function StoredTemplates() {
  const { showDialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const { create, focusedDefinition, setFocused } = useInteractionRegistry();
  const { templates, removeTemplate } = useTemplatesRegistry();
  const [filterToSources, setFilterToSources] = useLocalStorage<InteractionSourceType[]>("interaction-filters", []);
  const filteredTemplates = useMemo(() => {
    const searchQueryResults = searchTerm === "" ? templates : templates.filter((template) => template.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const sourceFilterResults = filterToSources.length === 0 ? searchQueryResults : searchQueryResults.filter(e => filterToSources.includes(e.source));

    return sourceFilterResults;
  }, [searchTerm, filterToSources, templates]);
  const filteredAndSortedTemplates = useMemo(
    () =>
      filteredTemplates.sort(
        (a, b) => b.updatedDate.getTime() - a.updatedDate.getTime()
      ),
    [filteredTemplates]
  );

  function toggleSourceFilter(sourceType: InteractionSourceType) {
    if (filterToSources.includes(sourceType)) {
      setFilterToSources(filterToSources.filter(e => e !== sourceType));
    } else {
      setFilterToSources([...filterToSources, sourceType])
    }
  }

  function renderSourceFilterBadge(sourceType: InteractionSourceType) {
    const nameLookup: Record<InteractionSourceType, string> = {
      flix: "flix",
      session: "snippets",
      workspace: "files"
    }

    const isSelected = filterToSources.includes(sourceType);

    return (
      <BaseBadge
        className={classNames(classes.badge, {
          [classes.selectedBadge]: isSelected
        })}
        onClick={() => toggleSourceFilter(sourceType)}>
        {nameLookup[sourceType]}
      </BaseBadge>
    )
  }

  return (
    <div>
      <div className={classes.header}>
        <SearchInput
          placeholder="Search interactions ..."
          searchTerm={searchTerm}
          onChangeSearchTerm={setSearchTerm}
        />
        <div className={classes.badgeFilters}>
          {renderSourceFilterBadge("flix")}
          {renderSourceFilterBadge("session")}
          {renderSourceFilterBadge("workspace")}
        </div>
      </div>
      <div className={classes.storedTemplates}>
        {filteredAndSortedTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => {
              const createdInteraction = create(template);
              setFocused(createdInteraction.id);
            }}
            className={classNames(classes.item, {
              [classes.focusedItem]: focusedDefinition?.id === template.id
            })}
          >
            <InteractionLabel interaction={template} />
            {template.source === "session" && (
              <FlowserIcon.Trash
                className={classes.trash}
                onClick={(e) => {
                  e.stopPropagation();
                  showDialog({
                    title: "Remove template",
                    body: (
                      <span style={{ textAlign: "center" }}>
                        Do you wanna permanently remove stored template
                        {`"${template.name}"`}?
                      </span>
                    ),
                    confirmButtonLabel: "REMOVE",
                    cancelButtonLabel: "CANCEL",
                    onConfirm: () => removeTemplate(template)
                  });
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusedInteraction() {
  const { focusedDefinition } = useInteractionRegistry();
  const { templates } = useTemplatesRegistry();

  const correspondingTemplate = templates.find(
    (template) => template.id === focusedDefinition?.id
  );

  return (
    <div className={classes.focusedTemplate}>
      {focusedDefinition && <FlixInfo interaction={focusedDefinition} />}
      {correspondingTemplate?.source === "workspace" && (
        <WorkspaceTemplateInfo workspaceTemplate={correspondingTemplate.workspace!} />
      )}
    </div>
  );
}

function WorkspaceTemplateInfo(props: { workspaceTemplate: WorkspaceTemplate }) {
  const { workspaceTemplate } = props;

  return (
    <div className={classes.workspaceInfo}>
      Open in:
      <div className={classes.actionButtons}>
        <IdeLink.VsCode filePath={workspaceTemplate.filePath} />
        <IdeLink.WebStorm filePath={workspaceTemplate.filePath} />
        <IdeLink.IntellijIdea filePath={workspaceTemplate.filePath} />
      </div>
    </div>
  );
}
