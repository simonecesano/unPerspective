#!/usr/bin/env perl
use Mojolicious::Lite;

get '/' => sub {
  my $c = shift;
  $c->render(template => 'app');
};

app->start;
__DATA__
@@ layouts/default.html.ep
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.20.0/axios.js"
	    integrity="sha512-nqIFZC8560+CqHgXKez61MI0f9XSTKLkm0zFVm/99Wt0jSTZ7yeeYwbzyl0SGn/s8Mulbdw+ScCG41hmO2+FKw=="
	    crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/glfx@0.0.4/glfx.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue-router@3.4.8/dist/vue-router.min.js"></script>    
    <script src="https://cdn.jsdelivr.net/npm/http-vue-loader@1.4.1/src/httpVueLoader.js"></script>
    <script src="/pointCalc.js"></script>

    <title><%= title %></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <style>
      body { background-color: #111122; color: #dddddd; font-family: courier; font-weight: bold; font-size: 14pt }
    </style>
  </head>
  <body>
    <%= content %>
  </body>
  <script src="/app.js"></script>
</html>
@@ app.html.ep
% layout 'default';
% title 'Welcome';
<div id="app">
  <router-view>
  </router-view>
</div>
