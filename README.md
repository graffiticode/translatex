# TransLaTeX
A library for translating LaTeX

#### DESCRIPTION

This module implements a LaTeX translator using translation rules written in L120.

#### BUILD

```
$ make
```

This command will run ESLint linter and Jest tests.

#### INSTALLING

```
$ npm i './translatex'
```

where `./translatex` refers to the directory that contains this repo.

#### CALLING

```javascript
import {TransLaTeX} from '@artcompiler/translatex'
const str = TransLaTeX.translate(rules, '1 + 2');
```
where `rules` is a rules object created using **L120**. For example:
https://gc.acx.ac/item?id=3LgCjBbX9u0

A rules object is the DATA JSON obtained by clicking the **DATA** link in the navigation bar at the top of the Graffiticode browser window. Here is a sample:
https://gc.acx.ac/data?id=3LgCjBbX9u0

