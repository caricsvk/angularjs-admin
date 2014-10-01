'use strict';

window.SETTINGS = {
	version: '0.1',
	jsPrefix: 'js/',
	initCtrl: 'home',
	urlHeader: 'tpl/header.html',
	urlFooter: 'tpl/footer.html',
	servicesLocation: '//localhost/gf/jersey',
	layouts: ['top', 'top-left', 'left', 'left-top'],
	layout: 'top',
	colors: ['green', 'light green', 'blue', 'light blue', 'brown', 'light brown', 'gray', 'light gray'],
	color: 'light green',
	languages: ['en', 'sk', 'cz'],
	language: 'en',
	animations: {
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
