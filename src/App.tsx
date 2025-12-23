import Home from "./Home.tsx";
import { store } from "./store/useTimerStore.ts";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<Provider store={store}>
				<Home />
			</Provider>
		</StrictMode>,
	);
}
