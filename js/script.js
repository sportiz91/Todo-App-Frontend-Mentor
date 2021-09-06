//DOM Queries before initial render:
const newTodo = document.querySelector("[data-new-task]");
const tasks =
  document.querySelectorAll("[data-tasks]"); /* tasks is used for the
initial loading of the page. Then we have an updatedTasks when we populated
listOfTasks with the updated tasks */
const itemsLeft = document.querySelector("[data-items-left]");
const clearCompleted = document.querySelector("[data-clear-completed]");
const all = document.querySelector("[data-btn-all]");
const active = document.querySelector("[data-btn-active]");
const completed = document.querySelector("[data-btn-completed]");
const theTemplate = document.querySelector("[data-the-template]");

const TASKS_KEYS = "tasksKey";
const ACTIVE_TASKS_KEYS = "activeTasksKey";
const COMPLETED_TASKS_KEYS = "completedTasksKey";
const SELECTED_LIST_KEYS = "selectedListKey";

let arrayTasks = JSON.parse(localStorage.getItem(TASKS_KEYS)) || [];
let activeTasks = JSON.parse(localStorage.getItem(ACTIVE_TASKS_KEYS)) || [];
let completedTasks =
  JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEYS)) || [];
let selectedList = localStorage.getItem(SELECTED_LIST_KEYS);
let listOfTasks = document.querySelector("[data-list-of-tasks]"); /* difference
between listOfTasks and tasks is that the former selects the container */
let draggables = [];
let finalArray = [];

//first time you load the page, arrayTasks is generated with "mockup tasks".
//First time you load the page arrayTasks may get "" == [] or null == undefined.
if (arrayTasks == "" || arrayTasks == null) {
  for (let i = 0; i < tasks.length; i++) {
    const taskDivName =
      tasks[i].children[0].children[2].innerText; /* task label
    paragraph inner text */
    const taskDivCompleted =
      tasks[i].children[0].children[0].checked; /* true or
    false depending checked false checkbox or unchecked */
    const taskNewId = (
      Date.now() + i
    ).toString(); /* unique identifier for every task
    + i gives the unique identifier. If not, the sequence is executed at the same
    time */
    const taskDivArray = [taskDivName, taskDivCompleted, taskNewId];
    arrayTasks.push(
      taskGenerator(taskDivArray)
    ); /* populate arrayTasks array */
    activeTasks = arrayTasks; /* first time you load the page, because no task
    is marked as completed, activeTasks must be equal arrayTasks */
  }
}

//Functions
//taskGenerator receive an array as input and creates an object with 3 properties:
//name, completed flag and unique identifier. This objects are gonna populate
//arrayTasks, activeTasks and completedTasks.
function taskGenerator(item) {
  const myObject = {
    name: item[0],
    completed: item[1],
    id: item[2],
  };

  return myObject;
}

//saveAndRender function only executes save and render.
function saveAndRender(array) {
  save();
  render(array); //receives an array (that can be arrayTasks, activeTasks or
  //completed tasks)
}

//saving function. Save the actual state of arrayTasks, activeTasks and
//completedTasks. Then, saves the selectedList (which can have 3 values: All,
//Active or Completed).
function save() {
  localStorage.setItem(TASKS_KEYS, JSON.stringify(arrayTasks));
  localStorage.setItem(ACTIVE_TASKS_KEYS, JSON.stringify(activeTasks));
  localStorage.setItem(COMPLETED_TASKS_KEYS, JSON.stringify(completedTasks));
  localStorage.setItem(SELECTED_LIST_KEYS, selectedList);
}

//render function. Receives the array as parameter (arrayTasks, activeTasks or
//completedTasks)
function render(array) {
  clearElements();
  renderAllTasks(array);
  remainingItems();
}

//clearElements function.
//function is executed as long as listOfTasks have child elements. When listOfTasks
//does not have more child elements, then while is evaluated to false and no
//executed anymore.
function clearElements() {
  while (listOfTasks.firstElementChild) {
    listOfTasks.removeChild(listOfTasks.firstElementChild);
  }
}

//renderAllTasks function. Receives the array as parameter (arrayTasks, activeTasks
//or completedTasks).
//1. Iterates through every element of the array received. Then, creates the tasks.
//2. Then, for every task created executes dragAndDrop function with the dragging
//events listener for each one.
function renderAllTasks(array) {
  array.forEach((task) => {
    const newTask = document.importNode(theTemplate.content, true); //import the
    //template with all his childs
    const myLabel = newTask.querySelector(".task-label"); //task label gets
    //everything except delete task button
    const myInput = newTask.querySelector(".false-checkbox"); //selects false
    //checkbox
    const mySpan = newTask.querySelector(".task-label-paragraph"); //selects
    //only the paragraph ("Read for 1 hour").
    const myCross = newTask.querySelector(".delete-task"); //selects delete
    //task button.

    myLabel.htmlFor = task.id; //my label, which is everything, has a for with
    //the task id.
    myInput.id = task.id; //my input, which is the false checkbox, also gets the
    //same id, in order to make clickable in the text
    myInput.checked = task.completed; //checked or not, depending on actual state
    mySpan.append(task.name); //we append to the task label paragraph, the actual
    //name of the task
    myCross.id = task.id; //CHECK! Why deletting button also have the same id ?

    listOfTasks.appendChild(newTask); //append to listOfTasks the new task created
  });

  const updatedTasks = document.querySelectorAll(".task"); //gets updated tasks
  draggables = [...updatedTasks]; //draggables is an array with the tasks as elements

  dragAndDrop(draggables);
}

//newTaskEffect it's a function only used to give the transition of adding a new
//todo.
function newTaskEffect() {
  const lastTaskAdded = listOfTasks.lastElementChild; //lastElementChild is the newly
  //task created.
  lastTaskAdded.classList.add("no-color"); //we add the no-color, no-opacity which
  //are the beggining of the transition.
  lastTaskAdded.firstElementChild.classList.add("no-opacity");
  lastTaskAdded.lastElementChild.classList.add("no-opacity");

  //we have to set a timeout in order to transition have effect.
  setTimeout(() => {
    lastTaskAdded.classList.add("yes-color"); //we add color and opacity.
    lastTaskAdded.firstElementChild.classList.add("yes-opacity");
    lastTaskAdded.lastElementChild.classList.add("yes-opacity");
  }, 2);
}

//dragAndDrop function. Receives an array with the tasks as inputs (draggables).
//1. Iterates through every element of the draggables array (which have the tasks)
//and add event listeners: dragstart, dragend and dragover.
function dragAndDrop(draggables) {
  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", (e) => {
      e.target.classList.add("dragging"); //asings dragging class to the triggering
      //task. Dragging only changes the cursor to move and it's useful for dragover
    });

    draggable.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging"); //remove dragging class added before
      finalArray = [];

      //document.querySelectorAll(".task") only gets the task of the actual tab
      //(All, Active or Completed).
      //Populate the finalArray array. After populating, we have the finalArray
      //with the correct order of tasks (after dragging). This is useful the next
      //time we load the page.
      for (let i = 0; i < document.querySelectorAll(".task").length; i++) {
        const taskDivName =
          listOfTasks.children[i].children[0].children[2].innerText;
        const taskDivCompleted =
          listOfTasks.children[i].children[0].children[0].checked;
        const taskNewId = listOfTasks.children[i].children[0].children[0].id;
        const taskDivArray = [taskDivName, taskDivCompleted, taskNewId];
        finalArray.push(taskGenerator(taskDivArray));
      }

      //With finalArray populated with the correct order, we save finalArray for
      //arrayTasks, activeTasks or completedTasks depending on the active list
      if (
        selectedList === "all" ||
        selectedList == "null" ||
        selectedList == null
      ) {
        arrayTasks = finalArray;
      } else if (selectedList === "active") {
        activeTasks = finalArray;
      } else if (selectedList === "completed") {
        completedTasks = finalArray;
      }

      //finally we save.
      save();
    });

    //dragover means, when we enter the zone of a draggable item
    draggable.addEventListener("dragover", (e) => {
      e.preventDefault(); //default behaviour is the drag and drop forbidden

      const y = e.clientY; //we save the Y position of the triggering element
      const draggingDiv = document.querySelector(".dragging"); //we select
      //the draggingDiv
      const targetDivs = [...document.querySelectorAll(".task:not(.dragging)")];
      //we select all the other divs

      const afterElement = getAfterElement(y, targetDivs); //we save the afterElement

      if (afterElement == null) {
        //if afterElement is null, it means we dragged
        //the element to the last position, so we must do only an appendChild
        //which appends at the end
        listOfTasks.appendChild(draggingDiv);
      } else {
        //else, we append before the afterElement we got.
        listOfTasks.insertBefore(draggingDiv, afterElement);
      }
    });
  });
}

//getAfterElement function. Receives the y position of the triggering element and
//the targetDivs (everyone except dragging div) as inputs.
function getAfterElement(y, targetDivs) {
  const targetObject = targetDivs.reduce(
    (acumulationOrInitial, actual) => {
      const box = actual.getBoundingClientRect();

      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > acumulationOrInitial.offset) {
        return { offset: offset, child: actual };
      } else {
        return acumulationOrInitial;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  );

  return targetObject.child;
}

//remainingItems function. The purpose of this function is to get the number of
//unfinished tasks in the arrayTasks (not for active or completed tasks, which
//does not make sense).
function remainingItems() {
  const remainingTasks = arrayTasks.filter((task) => {
    return task.completed === false; //we grab all the tasks with the completed
    //flag marked as false (uncompleted).
  }).length; //then, the length. Remember that arra.find only grabs the first
  //element that evaluates the function to true.
  itemsLeft.innerText = `${remainingTasks} ${
    remainingTasks === 1 ? "item" : "items"
  } left`;
}

//Event Listeners:

//Submit form
newTodo.addEventListener("submit", (e) => {
  e.preventDefault(); //we prevent default, which is refreshing page after submitting

  if (e.target.firstElementChild.value == "") return; //triggering element is input
  //if input value is "", then, return the function cause we do not allow empty
  //tasks.

  const value = e.target.firstElementChild.value;
  const completed = false; //newly created task must be false for the flag.
  const id = Date.now().toString(); //unique id.
  const submitArray = [value, completed, id];
  arrayTasks.push(taskGenerator(submitArray)); //populate arrayTasks with the
  //newly created task.
  e.target.firstElementChild.value = null; //empty the todo input.

  if (selectedList === "active") {
    activeTasks = arrayTasks.filter((task) => {
      return !task.completed;
    });
    saveAndRender(activeTasks); //if we are in the active tasks tab, we pass to
    //saveAndRender the active tasks array.
    newTaskEffect(); //then we execute the newTask Effect.
  } else if (selectedList === "completed") {
    saveAndRender(completedTasks); //if we are in completed tasks tab, we pass to
    //saveAndRender the completed tasks array.
    newTaskEffect(); //then we execute the new task effect
  } else if (selectedList === "all") {
    saveAndRender(arrayTasks); //same.
    newTaskEffect();
  }
});

//when we click over the listOfTasks container, two scenarios are possible:
//we clicked the false checkbox or we clicked the delete task button.
listOfTasks.addEventListener("click", (e) => {
  if (e.target.classList[0] === "false-checkbox") {
    const taskChecked = arrayTasks.find((task) => {
      return task.id === e.target.id; //we only grab the task with matching id.
    });
    taskChecked.completed = !taskChecked.completed; //oposite of current state
    //is saved in the completed flag.
    save(); //save
    remainingItems(); //update remaining items.

    if (selectedList === "active") {
      activeTasks = arrayTasks.filter((task) => {
        return !task.completed;
      });

      saveAndRender(activeTasks); //save and render active list.
    }

    if (selectedList === "completed") {
      completedTasks = arrayTasks.filter((task) => {
        return task.completed;
      });

      saveAndRender(completedTasks); //save and render completed list.
    }
  }

  //second scenario, when we press a delete task button.
  if (e.target.classList[0] === "delete-task") {
    arrayTasks = arrayTasks.filter((task) => {
      return task.id !== e.target.id; //we grab all the tasks except the one we clicked
    });

    activeTasks = activeTasks.filter((task) => {
      return task.id !== e.target.id; //same for activeTasks
    });

    completedTasks = completedTasks.filter((task) => {
      return task.id !== e.target.id; //same for completedTasks
    });

    //this is the deletting effect.
    const parentTask = e.target.parentElement; //all the task div
    const cross = e.target; //cross
    const theLabel = parentTask.firstElementChild; //label
    const circleBackground = parentTask.querySelector(".real-checkbox-2");

    const height = parentTask.clientHeight; //we save in the height variable
    //the actual height of the task div. This is needed because we must fix the
    //height before doing this transition effect.

    parentTask.style.height = height + "px"; //fixing the height
    parentTask.style.border = "0"; //eliminating the border
    parentTask.style.position = "relative"; //we make position relative all the
    //task, because label and deletting button will be absolute positioned.
    parentTask.style.opacity = "1"; // opacity = 1.
    cross.style.position = "absolute";
    cross.style.right = "16px"; //Initial position of the effect. 16 px like a
    //"padding right",
    cross.style.opacity = "1";
    theLabel.style.position = "absolute";
    theLabel.style.left = "16px"; //initial position of the label. 16 px like a
    //"padding left".
    theLabel.style.opacity = "1";

    parentTask.classList.add("add-transition"); //adding the transition classes.
    cross.classList.add("delete-opacity");
    theLabel.classList.add("label-opacity");

    //we need a timeout in order to transition taking effect.
    setTimeout(() => {
      parentTask.style.height = "0"; //eating from bottom to top effect.
      parentTask.style.backgroundColor = "var(--outer-background)"; //like an empty
      //effect.
      parentTask.style.border = "0"; //border, padding and everything has to be
      //0 in order to this effect take place.
      parentTask.style.padding = "0";
      parentTask.style.opacity = "0";
      cross.style.opacity = "0";
      cross.style.right = "80px";
      theLabel.style.opacity = "0";
      theLabel.style.left = "-48px";
      circleBackground.classList.add("no-transition");
      circleBackground.style.backgroundColor = "var(--outer-background)";
    }, 2);

    //render the correct list. Timeout needs to be after all the effect is completed.
    setTimeout(() => {
      if (selectedList === "all") {
        saveAndRender(arrayTasks);
      } else if (selectedList === "active") {
        saveAndRender(activeTasks);
      } else if (selectedList === "completed") {
        saveAndRender(completedTasks);
      }
    }, 1002);
  }
});

clearCompleted.addEventListener("click", (e) => {
  if (selectedList === "all") {
    arrayTasks = arrayTasks.filter((task) => {
      return !task.completed;
    });

    saveAndRender(arrayTasks);
  } else if (selectedList === "active") {
    arrayTasks = arrayTasks.filter((task) => {
      return !task.completed;
    });

    saveAndRender(activeTasks);
  } else if (selectedList === "completed") {
    arrayTasks = arrayTasks.filter((task) => {
      return !task.completed;
    });

    completedTasks = [];

    saveAndRender(completedTasks);
  }
});

active.addEventListener("click", (e) => {
  selectedList = "active";
  activeTasks = arrayTasks.filter((task) => {
    return !task.completed;
  });

  e.target.classList.add("active");
  all.classList.remove("active");
  completed.classList.remove("active");

  saveAndRender(activeTasks);
});

all.addEventListener("click", (e) => {
  selectedList = "all";

  e.target.classList.add("active");
  active.classList.remove("active");
  completed.classList.remove("active");

  saveAndRender(arrayTasks);
});

completed.addEventListener("click", (e) => {
  selectedList = "completed";
  completedTasks = arrayTasks.filter((task) => {
    return task.completed;
  });
  e.target.classList.add("active");
  all.classList.remove("active");
  active.classList.remove("active");

  saveAndRender(completedTasks);
});

//initial render()
if (selectedList == null || selectedList == "null" || selectedList === "all") {
  render(arrayTasks);
} else if (selectedList === "active") {
  active.classList.add("active");
  all.classList.remove("active");
  completed.classList.remove("active");

  render(activeTasks);
} else if (selectedList === "completed") {
  completed.classList.add("active");
  all.classList.remove("active");
  active.classList.remove("active");

  render(completedTasks);
}
