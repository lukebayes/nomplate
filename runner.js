
import './test/express_test';
import './test/pretty_test';
import './test/nomplate_test';
import './test/nomtml_test';

process.on('exit', () => console.log('>> Exiting after all tests'));
