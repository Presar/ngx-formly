import { AppModule as SearchSelectAppModule } from './app.module';
import { AppComponent as SearchSelectAppComponent } from './app.component';

const SearchSelectExampleConfig = {
  title: 'SearchSelect type',
  component: SearchSelectAppComponent,
  debug: true,
  files: [
    { file: 'app.component.html', content: require('!!highlight-loader?raw=true&lang=html!./app.component.html'), filecontent: require('!!raw-loader!./app.component.html') },
    { file: 'app.component.ts', content: require('!!highlight-loader?raw=true&lang=typescript!./app.component.ts'), filecontent: require('!!raw-loader!./app.component.ts') },
    { file: 'app.module.ts', content: require('!!highlight-loader?raw=true&lang=typescript!./app.module.ts'), filecontent: require('!!raw-loader!./app.module.ts') },
  ],
};

export {
  SearchSelectAppModule,
  SearchSelectAppComponent,
  SearchSelectExampleConfig,
};
