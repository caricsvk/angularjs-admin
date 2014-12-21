'use strict';

window.SETTINGS = {
	version: '0.1',
	jsPrefix: 'js/',
	initCtrl: 'home',
	urlHeader: 'tpl/header.html',
	urlFooter: 'tpl/footer.html',
	loginUrl: 'auth',
	servicesLocation: '//127.0.0.1/gf/jersey',
	layouts: ['top'],//, 'left'],
	layout: 'top',
	colors: ['green', 'light green'],//, 'blue', 'light blue', 'brown', 'light brown', 'gray', 'light gray'],
	color: 'light green',
	languages: ['en', 'sk', 'cz'],
	language: 'en',
	base: '/milo/admin/',
	titlePostfix: 'Ng-Admin',
	ngModules: ["ngResource", "ngAnimate", "ngRoute", "ui.tinymce"],
	menu: [
		{name: 'home', class: 'fa-home'},
		{name: 'clients', class: 'fa-user'},
		{name: 'orders', class: 'fa-truck'},
		{name: 'products', class: 'fa-newspaper-o'},
		{name: 'categories', class: 'fa-list-alt'}
	], animations: {
		'default': "submenu-next",
		'clients->orders': 'menu-next',
		'clients->products': 'menu-next',
		'clients->categories': 'menu-next',
		'orders->products': 'menu-next',
		'orders->categories': 'menu-next',
		'products->categories': 'menu-next',
		'categories->products': 'menu-prev',
		'categories->orders': 'menu-prev',
		'categories->clients': 'menu-prev',
		'products->orders': 'menu-prev',
		'products->clients': 'menu-prev',
		'orders->clients': 'menu-prev',
		'clients': {
			'list->put': 'submenu-prev',
			'put->list': 'submenu-next',
		}, 'categories': {
			'list->put': 'submenu-prev',
			'put->list': 'submenu-next',
		}, 'products': {
			'list->put': 'submenu-prev',
			'put->list': 'submenu-next',
		},
	}
};
