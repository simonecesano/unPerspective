var app = new Vue({
    el: '#app',
    mounted: function(){
	console.log('foo');
    },
    router: (new VueRouter({
	routes: [
	    { path: '/',         redirect: '/correct' },
	    { path: '/correct',  component: httpVueLoader('components/correct.vue') },
	]})),
    data: {
	screen: {}
    }
})
