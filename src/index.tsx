import React from 'react';
import ReactDOM from 'react-dom';
import 'tufte-css/tufte.css';
import Essay from './essay.mdx';
import { MDXProvider } from '@mdx-js/react';

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

function App() {
  return (
    <MDXProvider>
      <Essay />
    </MDXProvider>
  );
}
