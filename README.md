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

where rules are rules created using L120, such as like this:
https://gc.acx.ac/item?id=3LgCjBbX9u0

The `rules` object is the DATA JSON, such as this:
https://gc.acx.ac/data?id=3LgCjBbX9u0
obtained by clicking the DATA link in the navigation bar at the top of the browser window.

