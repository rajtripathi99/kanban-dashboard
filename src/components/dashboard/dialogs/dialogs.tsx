"use client";

import { useUiStore } from "@/stores/ui-store";
import { HelpDialog } from "./help-dialog";
import { ImportDialog } from "./import-dialog";
import { InviteDialog } from "./invite-dialog";
import { RenameBoardDialog } from "./rename-board-dialog";
import { SettingsDialog } from "./settings-dialog";
import { TaskDialog } from "./task-dialog";

export function Dialogs() {
  const dialog = useUiStore((state) => state.dialog);
  const dialogSession = useUiStore((state) => state.dialogSession);
  const closeDialog = useUiStore((state) => state.closeDialog);

  return (
    <>
      {dialog?.type === "task" && (
        <TaskDialog
          key={`task-${dialogSession}`}
          taskId={dialog.taskId}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "new-task" && (
        <TaskDialog
          key={`new-${dialogSession}`}
          defaultColumnId={dialog.columnId}
          onClose={closeDialog}
        />
      )}
      <ImportDialog
        key={`import-${dialogSession}`}
        open={dialog?.type === "import"}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <InviteDialog
        key={`invite-${dialogSession}`}
        open={dialog?.type === "invite"}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <HelpDialog
        key={`help-${dialogSession}`}
        open={dialog?.type === "help"}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <SettingsDialog
        key={`settings-${dialogSession}`}
        open={dialog?.type === "settings"}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <RenameBoardDialog
        key={`rename-${dialogSession}`}
        open={dialog?.type === "rename-board"}
        onOpenChange={(open) => !open && closeDialog()}
      />
    </>
  );
}
