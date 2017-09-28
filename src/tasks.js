import { generate as id } from 'shortid';
import { Dispatcher, ReduceStore } from './flux';

const taskDispatcher = new Dispatcher();

const CREATE_TASK = "CREATE_TASK";
const COMPLETE_TASK = "COMPLETE_TASK";
const SHOW_TASK = "SHOW_TASK";

const createNewTaskAction = (content) => {
  return {
    type: CREATE_TASK,
    value: content
  }
};

const showTaskAction = (show) => {
  return {
    type: SHOW_TASK,
    value: show
  }
};

const completeTaskAction = (id, isComplete) => {
  return {
    type: COMPLETE_TASK,
    id,
    value: isComplete
  }
};

class TaskStore extends ReduceStore {
  getInitialState() {
    return {
      tasks: [{
        id: id(),
        content: "Update CSS styles",
        complete: false
      }, {
        id: id(),
        content: "Add unit tests",
        complete: false
      }, {
        id: id(),
        content: "Post to social media",
        complete: false
      }, {
        id: id(),
        content: "Install hard drive",
        complete: true
      }],
      showComplete: true
    }
  }
  reduce(state, action) {
    console.log("Reducing...", state, action);
    let newState;
    switch(action.type) {
      case CREATE_TASK:
        newState = { ...state, tasks: [...state.tasks]};
        newState.tasks.push({
          id: id(),
          content: action.value,
          complete: false
        });
        return newState;
      case SHOW_TASK:
        newState = { ...state, tasks: [...state.tasks], showComplete: action.value };
        return newState;
      case COMPLETE_TASK:
        newState = { ...state, tasks: [...state.tasks]};
        const affectedElementIndex = newState.tasks.findIndex(t => t.id === action.id);
        newState.tasks[affectedElementIndex] = { ...state.tasks[affectedElementIndex], complete: action.value };
        return newState;
    }
    return state;
  }
  
  getState() {
    return this.__state;
  }
}

const TaskComponent = ({content, complete, id}) => (
  `<section>
      ${content} <input type="checkbox" name="taskCompleteCheck" data-taskid=${id} ${complete ? "checked" : ""}>
  </section>`
)

document.forms.undo.addEventListener("submit", (e) => {
  e.preventDefault();
  taskStore.revertLastState();
})

const render = () => {
  const taskSection = document.getElementById("tasks");
  const state = taskStore.getState();
  const rendered = state.tasks
    .filter(task => state.showComplete ? true : !task.complete)
    .map(TaskComponent).join("");
  taskSection.innerHTML = rendered;
  
  document.getElementsByName("taskCompleteCheck").forEach(element => {
    element.addEventListener("change", (e) => {
      const id = e.target.attributes["data-taskid"].value;
      const checked = e.target.checked;
      taskDispatcher.dispatch(completeTaskAction(id, checked));
    })
  });
}

document.forms.newTask.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = e.target.newTaskName.value;
  if (name) {
    taskDispatcher.dispatch(createNewTaskAction(name));
    e.target.newTaskName.value = null;
  }
});

document.getElementById("showComplete").addEventListener("change", ({target}) => {
  const showComplete = target.checked;
  taskDispatcher.dispatch(showTaskAction(showComplete));
});

const taskStore = new TaskStore(taskDispatcher);

taskDispatcher.dispatch("TEST_DISPATCH");

taskStore.addListener(() => {
  render();
});

render();