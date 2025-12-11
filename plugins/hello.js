console.log('Hello World Plugin Loaded from Local Dev!');

if (window.appPlugin) {
  window.appPlugin.registerCommand({
    id: 'hello-world-dev',
    title: 'Hello World (Dev)',
    action: () => {
      alert('Hello from Local Dev Plugin!');
    }
  });
}
