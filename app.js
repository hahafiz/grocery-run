import { createClient, LiveList } from "@liveblocks/client";

const client = createClient({
  publicApiKey:
    "pk_dev_p4D2VuUEBdUE2uUNooNLc3CsLSvAQIStZPYwAjKhHcsIDPbFLBj50UH4ePyaZGOl",
});

async function run() {
  const { room, leave } = client.enterRoom("javascript-todo-app", {
    initialPresence: { isTyping: false },
    initialStorage: { todos: new LiveList() },
  });

  const whoIsHere = document.getElementById("who_is_here");
  const todoInput = document.getElementById("todo_input");
  const someoneIsTyping = document.getElementById("someone_is_typing");
  const todosContainer = document.getElementById("todos_container");

  const { root } = await room.getStorage();

  let todos = root.get("todos");

  room.subscribe("others", (others) => {
    whoIsHere.innerHTML = `There are ${others.count} other users online`;

    someoneIsTyping.innerHTML = others
      .toArray()
      .some((user) => user.presence?.isTyping)
      ? "Someone is typing..."
      : "";
  });

  todoInput.addEventListener("keydown", (e) => {
    // clear the input when the user presses "Enter".
    if (e.key === "Enter") {
      room.updatePresense({ isTyping: false });
      todos.push({ text: todoInput.value });
      todoInput.value = "";
    } else {
      room.updatePresense({ isTyping: true });
    }
  });

  todoInput.addEventListener("blur", () => {
    room.updatePresense({ isTyping: false });
  });

  function renderTodos() {
    todosContainer.innerHTML = "";

    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];

      const todoContainer = document.createElement("div");
      todoContainer.classList.add("todo_container");

      const todoText = document.createElement("div");
      todoText.classList.add("todo");
      todoText.innerHTML = todo.text;
      todoContainer.appendChild(todoText);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete_button");
      deleteButton.innerHTML = "✕";
      deleteButton.addEventListener("click", () => {
        todos.delete(i);
      });
      todoContainer.appendChild(deleteButton);

      todosContainer.appendChild(todoContainer);
    }
  }

  room.subscribe(todos, () => {
    renderTodos();
  });
}

run();
