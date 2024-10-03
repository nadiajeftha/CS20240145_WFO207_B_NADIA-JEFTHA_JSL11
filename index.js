// TASK: import helper functions from utils
import { getTasks,saveTasks ,createNewTask, patchTask, putTask, deleteTask } from 'utils\taskFunctions.js'
// TASK: import initialData
import { initialData } from 'initialData.js';




/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName : document.getElementById('header-board-name'),
  columnDivs : document.querySelectorAll('.column-div'),
  editTaskModal : document.querySelector('.edit-task-modal-window'),
  modalWindow :document.getElementById('new-task-modal-window'),
  filterDiv : document.getElementById('filter-div'),
  hideSideBarBtn : document.getElementById('hide-side-bar-btn'),
  showSideBarBtn :document.getElementById('show-side-bar-btn'),
  themeSwitch :document.getElementById('switch'),
  createNewTaskBtn : document.getElementById('add-new-task-btn'),
}



let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click" , () => {
      elements.headerBoardName.textContent = board
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
  });
    boardsContainer.appendChild(boardElement);
});

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    //column.innerHTML = `<div class="column-head-div">
                         // <span class="dot" id="${status}-dot"></span>
                         // <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        //</div>`;
    const columnHead = column.querySelector('.column-head-div')
    const tasksContainer = column.querySelector('.tasks-container')
    tasksContainer.innerHTML = '' //clear tasks
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click" , () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click' , () => 
     toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click' , () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click' , () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' :'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
  const title =document.getElementById('title-input').value.trim()
  const description =document.getElementById('description-input').value.trim()
  const status =document.getElementById('select-status').value

  if (!title) {
    alert ("Can't leave empty!")
    return
  }

    const task = {
      title,
      description,
      status,
      board : activeBoard
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
//   const sideBar = document.getElementById('side-bar-div')
//   sideBar.style.display = show ? 'block' : 'none'
//   localStorage.setItem('showSideBar' , show)
// }
const sidebar = document.getElementById('side-bar-div')
const showBtn = document.getElementById('show-side-bar-btn')
const hideBtn = document.getElementById('hide-side-bar-btn')
if (show) {
  sidebar.classList.add('show-sidebar')
  showBtn.style.display = 'none'
  hideBtn.style.display = 'block'
  localStorage.setItem('showSideBar' , 'true')
}
else {
  sidebar.classList.remove('show-sidebar')
  showBtn.style.display = 'block'
  hideBtn.display = 'none'
  localStorage.setItem('showSideBar' , 'false')
  }
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme')
  localStorage.setItem('light-theme' , isLightTheme ? 'enabled' : 'disabled')
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title
  document.getElementById('edit-task-desc-input').value = task.decription
  document.getElementById('edit-select-status').value = task.status

  // Get button elements from the task modal
const editBtn = document.getElementById('task-modal-btn')

  // Call saveTaskChanges upon click of Save Changes button
 const saveBtn = document.getElementById('save-task-changes-btn')
 saveBtn.onclick = () => saveTaskChanges(task.id)

  // Delete task using a helper function and close the task modal
const deleteBtn = document.getElementById('delete-task-btn')
deleteBtn.onclick = () => {
  deleteTask(task.id)
  toggleModal(false, elements.editTaskModal)
  refreshTasksUI
}

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.getElementById('edit-task-title-input').value.trim()
  const updatedDescription = document.getElementById('edit-task-desc-input').value.trim()
  const updatedStatus = document.getElementById('edit-select-status').value
  
  if (!updatedTitle) { //to validate inputs
    alert ('ENTER TASK!')
    return
  }
  // Create an object with the updated task details
const updtaes = {
  title : updatedTitle,
  decription : updatedDescription,
  status : updatedStatus
}

  // Update task using a hlper functoin
 patchTask(taskId, updates)

  // Close the modal and refresh the UI to reflect the changes

  refreshTasksUI();
  toggleModal(false, elements.editTaskModal)
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}