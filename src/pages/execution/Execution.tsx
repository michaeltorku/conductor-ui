import { useState } from "react";

import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useExecutionAndTasks, useWorkflowDag } from "../../data/execution";
import { TaskCoordinate } from "../../types/workflowDef";

import TileFactory, { TileFactoryContext } from "./TileFactory";

import "flexlayout-react/style/light.css";
import DockLayout, { LayoutData, TabGroup } from "rc-dock";
import ExecutionHeader from "./ExecutionHeader";

const groups: { [key: string]: TabGroup } = {
  workflow: { animated: false },
  task: { animated: false },
};

const defaultLayout: LayoutData = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        group: "workflow",
        tabs: [
          {
            id: "WorkflowGraph",
            title: "Graph",
            content: <TileFactory component="WorkflowGraph" />,
          },
          {
            id: "WorkflowSummary",
            title: "Summary",
            content: <TileFactory component="WorkflowSummary" />,
          },
          {
            id: "WorkflowJson",
            title: "JSON",
            content: <TileFactory component="WorkflowJson" />,
          },
          {
            id: "TaskList",
            title: "Tasks",
            content: <TileFactory component="TaskList" />,
          },
          {
            id: "Timeline",
            title: "Timeline",
            content: <TileFactory component="Timeline" />,
          },
          {
            id: "WorkflowInput",
            title: "Input",
            content: <TileFactory component="WorkflowInput" />,
          },
          {
            id: "WorkflowOutput",
            title: "Output",
            content: <TileFactory component="WorkflowOutput" />,
          },
          {
            id: "WorkflowVariables",
            title: "Variables",
            content: <TileFactory component="WorkflowVariables" />,
          },
        ],
      },
      {
        group: "task",
        tabs: [
          {
            title: "Summary",
            id: "TaskSummary",
            content: <TileFactory component="TaskSummary" />,
          },
          {
            title: "Input",
            id: "TaskInput",
            content: <TileFactory component="TaskInput" />,
          },
          {
            title: "Output",
            id: "TaskOutput",
            content: <TileFactory component="TaskOutput" />,
          },
          {
            title: "Poll Data",
            id: "TaskPollData",
            content: <TileFactory component="TaskPollData" />,
          },
          {
            title: "Logs",
            id: "TaskLogs",
            content: <TileFactory component="TaskLogs" />,
          },
          {
            title: "Config",
            id: "TaskConfig",
            content: <TileFactory component="TaskConfig" />,
          },
          {
            title: "Results",
            id: "TaskExecution",
            content: <TileFactory component="TaskExecution" />,
          },
        ],
      },
    ],
  },
};

export default function Execution() {
  const params = useParams<{ id: string }>();
  const [selectedTask, setSelectedTask] = useState<TaskCoordinate | undefined>(
    undefined
  );

  //const [selectedTaskRison, setSelectedTaskRison] = useQueryState("task", "");

  if (!params.id) {
    throw new Error("Missing Execution ID");
  }
  const executionAndTasks = useExecutionAndTasks(params.id);
  const dag = useWorkflowDag(executionAndTasks);

  /*
    const selectedTask: TaskCoordinate | undefined = useMemo(
      () => selectedTaskRison ? rison.decode(selectedTaskRison) : undefined,
      [selectedTaskRison]
    );
  
    const setSelectedTask = (taskPointer: TaskCoordinate) => {
      setSelectedTaskRison(rison.encode(taskPointer));
    };
    */

  const refresh = () => {
    //    refetchExecutions();
    //refetchTasks();
  };

  return (
    <>
      <Helmet>
        <title>Conductor UI - Execution - {params.id}</title>
      </Helmet>
      {dag && executionAndTasks && (
        <TileFactoryContext.Provider
          value={{
            executionAndTasks,
            dag,
            selectedTask,
            setSelectedTask,
          }}
        >
          <ExecutionHeader executionAndTasks={executionAndTasks} />
          <DockLayout
            style={{ width: "100%", height: "100%" }}
            defaultLayout={defaultLayout}
            groups={groups}
          />
        </TileFactoryContext.Provider>
      )}
    </>
  );
}