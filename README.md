# Teste - VR Software

O teste consiste em dois projetos:

- `api`: backend construído em NestJS.
- `frontend`: frontend construído em Angular.

## Passo a passo

1. Clone o repositório:
   
```bash
$ git clone https://github.com/matheuslanduci/teste-vrsoftware.git

$ cd teste-vrsoftware
```

2. Instale as dependências do backend:

```bash
$ cd api
$ npm install
```

3. Crie um arquivo `.env` na raiz do projeto `api` com as variáveis de ambiente necessárias. Você pode usar o arquivo `.env.example` como referência.

4. Inicie o backend:

```bash
$ npm run start:dev
```

5. Instale as dependências do frontend:

```bash
$ cd ../frontend
$ npm install
```

6. Inicie o frontend:

```bash
$ npm start
```

7. Acesse o frontend no navegador:
   - URL: `http://localhost:4200`

## Testes unitários

Para executar os testes unitários do backend e do frontend, siga os passos abaixo:

### Backend

1. Navegue até o diretório do backend:

```bash
$ cd api
```

2. Execute os testes unitários:

```bash
$ npm run test:cov
```

### Frontend

1. Navegue até o diretório do frontend:

```bash
$ cd frontend
```

2. Execute os testes unitários:

```bash
$ ng test
```