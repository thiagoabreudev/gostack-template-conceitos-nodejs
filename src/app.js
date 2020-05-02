const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const validateRepositoryBody = (request, response, next) => {
  const { title, url, techs } = request.body;
  if (!title) {
    return response.status(400).json({ error: 'title is required!' });
  }
  if (!url) {
    return response.status(400).json({ error: 'url is required!' });
  }
  if (techs && !Array.isArray(techs)) {
    return response.status(400).json({ error: 'techs must be an array, ex: ["Node.js", "..."]' });
  }
  return next();
}

const hasRepository = (request, response, next) => {
  const { id } = request.params;
  const repository = repositories.find(repository => repository.id === id);
  if (!repository) {
    return response.status(400).json({ error: 'Repository not found!' });
  }
  response.locals.repository = repository;
  return next()
}

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", validateRepositoryBody, (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }
  repositories.push(repository)
  return response.status(201).json(repository)
});

app.put("/repositories/:id", hasRepository, (request, response) => {
  const repository = response.locals.repository;
  const { title, url, techs } = request.body;
  repository.title = title ? title: repository.title;
  repository.url = url ? url: repository.url;
  repository.techs = techs ? techs: repository.techs;
  return response.json(repository)
});

app.delete("/repositories/:id", hasRepository, (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories
    .findIndex(repository => repository.id === id);
  repositories.splice(repositoryIndex, 1)
  return response.status(204).send()
});

app.post("/repositories/:id/like", hasRepository, (request, response) => {
  const repository = response.locals.repository;
  repository.likes ++;
  return response.json(repository)
});

module.exports = app;
