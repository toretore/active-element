Demo.Post = ActiveElement.Base.spawn('post', {

  afterInitialize: function(){
    this.hijackRating();
    Demo.log('Post '+this.getID()+' was initialised');
  },

  //This will be used when you do post.get('title')
  getTitleElement: function(){
    return this.element.down('.title a');
  },
  
  //This will be used when you do post.get('link')
  getLinkValue: function(){
    return this.element.down('.title a').readAttribute('href');
  },
  //This will be used when you do set('link', 'something')
  setLinkValue: function(href){
    return this.element.down('.title a').writeAttribute('href', href);
  },
  
  getRating: function(){
    var p = this.element.down('.rating .average');
    return p ? parseFloat(p.innerHTML) : false;
  },

  rate: function(rating, callback){
    //This is where you would send off an Ajax request to save the rating
    //and get back the average, but in the demo we're simply using a
    //random number. Request is simulated with setTimeout
    this.element.addClassName('updating');
    this.element.down('.rating h4').update('Rating..');
    Demo.log('Rating post "'+this.get('title')+'" (ID '+this.getID()+') with '+rating);
    setTimeout(function(){
      this.element.down('.rating h4').update('Average rating');
      this.element.down('.rating ul').replace(
        '<p class="average">'+(Math.random()*5).toString().slice(0,3)+'</p>'
      );
      this.element.removeClassName('updating');
      Demo.log('Post "'+this.get('title')+'" was rated.');
      callback && callback();
    }.bind(this), 2000);
  },

  //Hijack the "Rate this post" links to use Ajax
  hijackRating: function(){
    var list = this.element.down('.rating ul');

    list && list.observe('click', function(e){
      var target = e.element();
      if (target.match('li a')) {
        e.stop();
        this.rate(target.innerHTML);
      }
    }.bindAsEventListener(this));
  }

});

Demo.Posts = ActiveElement.Collection.spawn('post', {

  extend: {
    attach: function(posts){
      Demo.posts = posts;
    }
  },

  afterInitialize: function(){
    Demo.log(this.size()+' posts were initialised');
  },

  sabotage: function(){
    return this.map(function(post){
      return [post.get('title'), post.get('summary').replace(/\s+/g, ' ').strip()];
    }).flatten().join('\n');
  }

});
