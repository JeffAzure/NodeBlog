let listItems = $('.list-item')
let rightWraps = $('.right-wrap')


listItems.on('click', function () {
  listItems.removeClass('active')
  $(this).addClass('active')
  let tag = $(this).attr('data-wrap')
  rightWraps.removeClass('active')
  $(`#${tag}`).addClass('active')
})