import { useEffect, useState } from 'react'
import './App.css'
import TodoItem from './components/TodoItem/TodoItem.jsx';
import List from './components/List/List.jsx';
import CreateListForm from './components/CreateListForm/CreateListForm.jsx';
import mockData from './mockdata.js';
import PatchNotesModal from './components/PatchNotesModal/PatchNotesModal.jsx';


export default function App() {
	const [lists, setLists] = useState(() => {
		const loadLists = JSON.parse(localStorage.getItem("lists") || "[]");
		return loadLists;
	})
	const [inputValue, setInputValue] = useState("");

	const [patchnotes, setPatchnotes] = useState([]);
	const [patchnotesOpen, setPatchnotesOpen] = useState(false);

	const [theme, setTheme] = useState("darkMode");

	const [error, setError] = useState("");
	const maxLength = 50;
	const siteName = "QuestLog";

	useEffect(() => {
		fetch("/changelog.json")
			.then((res) => res.json())
			.then((data) => {

				setPatchnotes(data);
				localStorage.setItem("changelog", JSON.stringify(data));
			});
	}, []);

	useEffect(() => {
		console.log("state changed");

		console.log("updated lists:", lists);
		localStorage.setItem("lists", JSON.stringify(lists));
	}, [lists])


	function togglePatchnotes(){
		if (patchnotesOpen){
			setPatchnotesOpen(false);
		} else if (!patchnotesOpen){
			setPatchnotesOpen(true);
		}
	}
	function toggleDarkMode() {
		if (theme === "darkMode") {
			setTheme("lightMode");
		} else if (theme === "lightMode") {
			setTheme("darkMode")
		}
	}
	function handleCreateList(title) {
		console.log("created list: ", title);

		setLists(prev => [
			...prev,
			{
				id: crypto.randomUUID(),
				title,
				todos: []
			}
		]);
	}
	function handleEditListTitle(listId, newTitle) {
		console.log("received: " + newTitle);

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? { ...list, title: newTitle }
					: list
			)
		);
	}
	function handleDeleteList(listId) {
		const confirmed = window.confirm("Delete this list?");

		if (!confirmed) {
			return;
		}

		const updatedState = lists.filter(list => list.id !== listId);
		setLists(updatedState);
	}
	function handleChange(value, listId) {
		setLists(prev => prev.map(list => list.id === listId
			? { ...list, inputValue: value }
			: list
		)
		);
	}
	function handleTodoEdit(listId, todoId, newTodo) {
		console.log("received: " + newTodo);

		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? {
						...list, todos: list.todos.map(todo =>
							todo.id === todoId
								? { ...todo, text: newTodo }
								: todo
						)
					}
					: list
			)
		)
	}
	function handleTodoDelete(listId, todoId) {
		console.log("received: " + todoId);

		const confirmed = window.confirm("Delete this task?");

		if (!confirmed) {
			return;
		}

		setLists(prev =>
			prev.map(list => {
				if (list.id !== listId) {
					return list
				} else {
					return {
						...list,
						todos: list.todos.filter(todo => todo.id !== todoId)
					};
				}
			})
		);
	};
	function handleAdd(text, listId) {
		if (!text.trim()) {
			return;
		}

		setLists(prev => prev.map(list => list.id === listId ? {
			...list,
			todos: [...list.todos,
			{
				id: crypto.randomUUID(),
				text,
				completed: false
			}
			]
		} : list
		)
		);
	}
	function handleToggle(listId, todoId) {
		setLists(prev =>
			prev.map(list =>
				list.id === listId
					? {
						...list,
						todos: list.todos.map(todo =>
							todo.id === todoId
								? { ...todo, completed: !todo.completed }
								: todo
						)
					}
					: list
			)
		);
	}
	function __clearStorage() {
		setLists([]);
		localStorage.setItem("lists", []);
	}
	function __loadMockStorage() {
		setLists(mockData);
	}

	return (
		<div id="app" data-theme={theme}>
			<div id="page-container">
				<header id="top-header">
					<nav>
						<h1>{siteName}</h1>
						<button id="patchnotes-toggle" onClick={togglePatchnotes}>Patch Notes</button>
						<button id="dark-mode-toggle" onClick={toggleDarkMode}>🌘 Dark Mode</button>
					</nav>
				</header>
				<main>
					<header id="pinned-lists">
					</header>
					<section id="lists-container">
						<CreateListForm onCreateList={handleCreateList} maxLength={maxLength} />
						<h2 id="lists-heading">Current Quests: </h2>
						<div id="all-lists">
							{lists.map(list => {
								return (
									<List key={list.id}
										id={list.id}
										title={list.title}
										listItems={list.todos}
										onListItemChange={(event) => handleChange(event, list.id)}
										onListItemAdd={handleAdd}
										onListItemEdit={handleTodoEdit}
										onListItemDelete={handleTodoDelete}
										onListItemToggle={(todoId) => handleToggle(list.id, todoId)}
										onListTitleChange={handleEditListTitle}
										onListDelete={(event) => handleDeleteList(list.id, list.title)}
										maxLength={maxLength}
									/>)
							})}
						</div>
					</section>
					<button onClick={__loadMockStorage}>__loadMockStorage()</button>
					<button onClick={__clearStorage}>__clearStorage()</button>
				</main>
			</div>
			<PatchNotesModal
				open={patchnotesOpen}
				onClose={() => setPatchnotesOpen(false)}
				patchnotes={patchnotes}
			/>
		</div>
	);
}
