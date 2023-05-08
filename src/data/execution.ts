import { useMemo } from "react";
import WorkflowDAG from "../components/diagram/WorkflowDAG";
import { WorkflowDef } from "../types/workflowDef";
import { Execution, ExecutionAndTasks } from "../types/execution";
import { useFetch } from "./common";
import { TaskConfig } from "../types/workflowDef";
import { TaskResult } from "../types/execution";
import useAppContext from "../hooks/useAppContext";
import { useQueries } from "react-query";

export function useWorkflow(workflowId: string) {
  return useFetch<Execution>(
    ["workflow", workflowId],
    `/v2/execution/${workflowId}`,
    {
      enabled: !!workflowId,
    }
  );
}

export function useWorkflowVariables(workflowId: string) {
  return useFetch(
    ["workflow", workflowId, "variables"],
    `/v2/execution/${workflowId}/variables`,
    {
      enabled: !!workflowId,
    }
  );
}

export function useWorkflowOutput(workflowId: string) {
  return useFetch(
    ["workflow", workflowId, "output"],
    `/v2/execution/${workflowId}/output`,
    {
      enabled: !!workflowId,
    }
  );
}

export function useWorkflowInput(workflowId: string) {
  return useFetch(
    ["workflow", workflowId, "input"],
    `/v2/execution/${workflowId}/input`,
    {
      enabled: !!workflowId,
    }
  );
}

// TODO: Should be done in backend for true interoperability.
export function useExecutionAndTasks(
  workflowId: string
): ExecutionAndTasks | undefined {
  const { fetchWithContext, ready, stack } = useAppContext();
  const results = useQueries([
    {
      queryKey: [stack, "workflow", workflowId],
      queryFn: () => fetchWithContext(`/v2/execution/${workflowId}`),
    },
    {
      queryKey: [stack, "workflow", workflowId, "tasks"],
      queryFn: async () => {
        const tasks: TaskResult[] = await fetchWithContext(
          `/v2/execution/${workflowId}/tasks`
        );

        // Populate refMap
        const refMap = new Map<string, TaskResult[]>();
        for (const task of tasks) {
          if (!refMap.has(task.referenceTaskName)) {
            refMap.set(task.referenceTaskName, []);
          }
          (refMap.get(task.referenceTaskName) as TaskResult[]).push(task);
        }

        const dynamicForkTaskResults = tasks.filter(
          (task) => task.taskType === "FORK"
        );

        const dfInputs: ForkTaskInput[] = await Promise.all(
          dynamicForkTaskResults.map((taskResult) =>
            fetchWithContext(
              `/v2/execution/${workflowId}/task/${taskResult.referenceTaskName}/input?taskId=${taskResult.taskId}`
            )
          )
        );
        const dfForkedTasks = dfInputs.map((input) => input.forkedTasks);

        for (let i = 0; i < dfForkedTasks.length; i++) {
          const dfRef = dynamicForkTaskResults[i].referenceTaskName;
          for (const childRef of dfForkedTasks[i]) {
            const results = refMap.get(childRef) as TaskResult[];
            for (const result of results) {
              result.parentTaskReferenceName = dfRef; // Mutating here should affect tasks also due to reused references.
            }
          }
        }

        return tasks;
      },
    },
  ]);

  const executionData = results[0].data;
  const tasksData = results[1].data;

  const retval = useMemo(
    () =>
      executionData && tasksData
        ? {
            execution: executionData,
            tasks: tasksData,
          }
        : undefined,
    [executionData, tasksData]
  );

  return retval;
}

type ForkTaskInput = {
  forkedTasks: string[];
  forkedTaskDefs: TaskConfig[];
};
export function useWorkflowDag(executionAndTasks?: ExecutionAndTasks) {
  return useMemo(() => {
    return executionAndTasks
      ? WorkflowDAG.fromExecutionAndTasks(executionAndTasks)
      : undefined;
  }, [executionAndTasks]);
}

export function useWorkflowDagFromDef(workflowDefinition?: WorkflowDef) {
  return useMemo(() => {
    return workflowDefinition
      ? WorkflowDAG.fromWorkflowDef(workflowDefinition)
      : undefined;
  }, [workflowDefinition]);
}

export function useWorkflowTask(
  workflowId?: string,
  taskReferenceName?: string,
  taskId?: string
) {
  let path = `/v2/execution/${workflowId}/task/${taskReferenceName}`;
  if (taskId) {
    path += `?taskId=${taskId}`;
  }
  return useFetch(["workflow", workflowId!, "task", taskReferenceName!], path, {
    enabled: !!workflowId && !!taskReferenceName,
  });
}

export function useWorkflowTaskOutput(
  workflowId?: string,
  taskReferenceName?: string,
  taskId?: string
) {
  let path = `/v2/execution/${workflowId}/task/${taskReferenceName}/output`;
  if (taskId) {
    path += `?taskId=${taskId}`;
  }
  return useFetch(
    ["workflow", workflowId!, "task", (taskId || taskReferenceName)!, "output"],
    path,
    {
      enabled: !!workflowId && !!taskReferenceName,
    }
  );
}

export function useWorkflowTaskInput(
  workflowId?: string,
  taskReferenceName?: string,
  taskId?: string
) {
  let path = `/v2/execution/${workflowId}/task/${taskReferenceName}/input`;
  if (taskId) {
    path += `?taskId=${taskId}`;
  }
  return useFetch(
    ["workflow", workflowId!, "task", (taskId || taskReferenceName)!, "input"],
    path,
    {
      enabled: !!workflowId && !!taskReferenceName,
    }
  );
}