"use strict";
const { contextBridge, ipcRenderer } = require("electron");
const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);
contextBridge.exposeInMainWorld("articleApi", {
  listArticles: () => invoke("articles:list"),
  readArticle: (name) => invoke("articles:read", name),
  saveArticle: (name, content) => invoke("articles:save", name, content),
  deleteArticle: (name) => invoke("articles:delete", name),
  gitStatus: () => invoke("git:status"),
  commitAndPush: (message) => invoke("git:commitAndPush", message)
});
