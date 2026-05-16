import { useEffect, useState } from 'react'
import './App.css'
import TodoItem from './components/TodoItem';
import List from './components/List';
import CreateListForm from './components/CreateListForm';


export default function App() {
	const [lists, setLists] = useState(() => {
		const loadLists = JSON.parse(localStorage.getItem("lists") || "[]");
		return loadLists;
	})
	const [inputValue, setInputValue] = useState("");

	const [theme, setTheme] = useState("darkMode");

	const [error, setError] = useState("");
	const maxLength = 50;
	const siteName = "QuestLog";

	useEffect(() => {
		console.log("state changed");
		localStorage.setItem("lists", JSON.stringify(lists));
	}, [lists])

	//todo: rework error <p> to show above relevant input field
	useEffect(() => {
		console.log(error);
		localStorage.setItem("error", error);
	}, [error]);

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

	function handleChange(value, listId) {
		setLists(prev => prev.map(list => list.id === listId
			? { ...list, inputValue: value }
			: list
		)
		);
	}

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

	return (
		<div id="app" data-theme={theme}>
			<div id="page-container">
				<header id="top-header">
					<nav>
						<h1>{siteName}</h1>
						<a id="dark-mode-toggle" onClick={toggleDarkMode}>🌘 Dark Mode</a>
					</nav>
				</header>
				<main>
					<header id="highlighted-list">
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
										onListItemToggle={(todoId) => handleToggle(list.id, todoId)}
										maxLength={maxLength}
									/>)
							})}
						</div>
					</section>
					<button onClick={__clearStorage}>__clearStorage()</button>
				</main>
			</div>
		</div>
	);
}