const getTasks = async (searchText) => {
    var url = "/api/tasks";

    if(searchText && searchText !== ""){
        url = "/api/tasks?search=" + searchText
    }

    try{
        const response = await fetch(url);
        const tasks = await response.json();

        if(tasks.error){
           return console.log(tasks.error);
        }

        if(tasks.length === 0){
            return document.querySelector("#task-wrapper").innerHTML = `<p>No tasks found!</p>`;
        }

        var tasksHtml = "";

        tasks.forEach(task => {
            tasksHtml = tasksHtml + generateTaskCart(task);
        });

        document.querySelector("#task-wrapper").innerHTML = tasksHtml;
    }catch(e){
        console.log("Something went wrong. Please try again!");
    }
}   

const createTask = async () => {
    hideModal("#create-modal");
    const prevContent = $("#create-btn").html();
    showLoader("#create-btn", {content: addingLoader});

    const data = {
        description: document.querySelector("#description").value,
        completed: document.querySelector("#completed").checked
    }

    try{
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
    
        const task = await response.json();

        if(task.error){
            return showError(task.error);
        }
    
        const taskCart =  generateTaskCart(task);

        $("#task-wrapper").prepend(taskCart);
        createForm[0].reset();
        showSuccess("Task added successfully!");
    }catch(e){
        showError("Something went wrong. Unable to create task!");
    }finally{
        hideLoader("#create-btn", {content: prevContent});
    }
}

const initiateUpdate = async (id) => {
    try{
        const response = await fetch("/api/tasks/" + id);
        const task = await response.json();

        if(task.error){
            return console.log(tasl.error);
        }

        document.querySelector("#task-id").value = task._id;
        document.querySelector("#updateDesc").value = task.description;
        document.querySelector("#updateCompleted").checked = task.completed;
        showModal("#update-modal");
    }catch(e){
        console.log("Something went wrong. Unable to find the task!");
    }
}

const updateTask = async () => {
    hideModal("#update-modal");
    const id = $("#task-id").val();

    const prevContent = $("#task-" + id + " .btn-primary").html();
    showLoader("#task-" + id + " .btn-primary", {content: generalLoader});

    const data = {
        description: document.querySelector("#updateDesc").value,
        completed: document.querySelector("#updateCompleted").checked
    }

    try{
        const response = await fetch("/api/tasks/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
    
        const task = await response.json();

        if(task.error){
            return showError(task.error);
        }

        
        $("#task-" + id + " h5").text(task.description);
        showSuccess("Task updated successfully!");
    }catch(e){
        showError("Something went wrong. Unable to update task!");
    }finally{
        hideLoader("#task-" + id + " .btn-primary", {content: prevContent});
    }
}

const initiateDelete = (id) => {
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this task data!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if(willDelete){
            deleteTask(id);
        }
    }); 
}

const deleteTask = async (id) => {
    const prevContent = $("#task-" + id + " .btn-danger").html();
    showLoader("#task-" + id + " .btn-danger", {content: generalLoader});

    try{
        const response = await fetch("/api/tasks/" + id, {
            method: "DELETE",
            headers:{
                "Content-Type": "application/json"
            }
        });
        
        const task = await response.json();

        if(task.error){
            return showError(task.error);
        }

        $("#task-" + id).remove();
        showSuccess("Task deleted successfully!");
    }catch(e){
        showError("Something went wrong. Unable to delete task!");
    }finally{
        hideLoader("#task-" + id + " .btn-danger", {content: prevContent});
    }
}

const generateTaskCart = (task) => {
    const bgColor = task.completed ? "bg-completed" : "";

    return `
        <div class="task-card ${bgColor}" id="task-${task._id}">
            <h5>${task.description}</h5>

            <div class="crud-buttons">
                <button class="btn btn-primary btn-sm" onclick="initiateUpdate('${task._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="initiateDelete('${task._id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
}

getTasks();


const createForm = $("#create-form");
const updateForm = $("#update-form");
const searchForm = $("#search-form");

createForm.validate({
    rules:{
        desc:{
            required: true
        }
    }
});

updateForm.validate({
    rules:{
        updateDesc:{
            required: true
        }
    }
});

createForm.on("submit", (e) => {
    e.preventDefault();

    if(createForm.valid()){
        createTask();
    }
});

updateForm.on("submit", (e) => {
    e.preventDefault();

    if(updateForm.valid()){
        updateTask();
    }
});

searchForm.on("submit", (e) => {
    e.preventDefault();

    const searchText = $("#search-input").val(); 
    getTasks(searchText);
});