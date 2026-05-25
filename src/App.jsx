import { useEffect, useState } from 'react'
import './App.css'
import ListView from './components/ListView/ListView.jsx';
import TodoItem from './components/TodoItem/TodoItem.jsx';
import List from './components/List/List.jsx';
import CreateListForm from './components/CreateListForm/CreateListForm.jsx';
import mockData from './mockdata.js';
import PatchNotesModal from './components/PatchNotesModal/PatchNotesModal.jsx';


export default function App() {
	const [lists, setLists] = useState(() => {
		const loadLists = JSON.parse(localStorage.getItem("lists") || "[]");

		return loadLists.map(list => ({
			...list,
			createdAt: list.createdAt ?? Date.now(),
			updatedAt: list.updatedAt ?? Date.now(),
			pinned: list.pinned ?? false,
		}));
	});

	//todo: persist sortMode so it doesnt default to createdAt on refreshes
	const [sortMode, setSortMode] = useState("createdAt");

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
	}, [lists]);


	function togglePatchnotes() {
		if (patchnotesOpen) {
			setPatchnotesOpen(false);
		} else if (!patchnotesOpen) {
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
				todos: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				pinned: false,
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
	function handlePin(listId) {
		console.log("pinned: " + listId);

		setLists(prev =>
			prev.map(list => list.id === listId
				? list.pinned ? { ...list, pinned: false }
					: { ...list, pinned: true }
				: list
			)
		)
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
					<header>
						<ListView role="pinned"
							lists={lists}
							onListItemChange={handleChange}
							onListItemAdd={handleAdd}
							onListItemEdit={handleTodoEdit}
							onListItemDelete={handleTodoDelete}
							onListItemToggle={handleToggle}
							onListTitleChange={handleEditListTitle}
							onListPin={handlePin}
							onListDelete={handleDeleteList}
							maxLength={maxLength}>
						</ListView>
					</header>
					<section id="lists-container">
						<CreateListForm onCreateList={handleCreateList} maxLength={maxLength} />
						<h2 id="lists-heading">Current Quests: </h2>
						<select onChange={(event) => {
							setSortMode(event.target.value);
						}}>
							<option value="createdAt">Newest</option>
							<option value="updatedAt">Last updated (not implemented)</option>
							<option value="alphabetical">Alphabetical</option>
						</select>
						<div id="all-lists">
							<ListView role="sorted" sortMode={sortMode}
								lists={lists}
								onListItemChange={handleChange}
								onListItemAdd={handleAdd}
								onListItemEdit={handleTodoEdit}
								onListItemDelete={handleTodoDelete}
								onListItemToggle={handleToggle}
								onListTitleChange={handleEditListTitle}
								onListPin={handlePin}
								onListDelete={handleDeleteList}
								maxLength={maxLength}>
							</ListView>
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
