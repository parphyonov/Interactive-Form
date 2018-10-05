// Global variables
const punDesigns = [
  'cornflowerblue',
  'darkslategrey',
  'gold'
];

const heartDesigns = [
  'tomato',
  'steelblue',
  'dimgrey'
];

// Sets focus on the first input element
$('#name').attr('autofocus', true);

// Hides #other-title from the view, so that it appears only when JS is disabled
$('#other-title').toggle();

// Whenever a user picks a different T-Shirt design the following logic will happen
$('#design').on('change', function() {
  // we get id of the selected option : 'js puns' or 'heart js'
  let selectedDesign = $(this).val();
  // we also target each color option available
  const $colors = $('#color option');
  // if 'js puns':
  if (selectedDesign === 'js puns') {
    // in case user switched between options before, 'tomato' selected attribute gets removed
    $colors.eq(3).removeAttr('selected');
    // to allow 'cornflowerblue' take this attribute
    $colors.eq(0).attr('selected', 'true');
  // if 'heart js':
  } else if (selectedDesign === 'heart js') {
    // the reversed operation to the one of the 'if' branch
    $colors.eq(0).removeAttr('selected');
    $colors.eq(3).attr('selected', 'true');
    // but here we also transform the selectedDesign value (that we obtained from options value)
    // and transform it into a part of the hearts options text
    // I liked the algorithm below and it was the only way to keep it this consice and working
    selectedDesign = 'js shirt';
  }
  // now we iterate over each color option
  $colors.each(function() {
    // and if its text value includes the name of selected design,
    if ($(this).text().toLowerCase().includes(selectedDesign)) {
      // it remains on display
      $(this).show();
    // if not,
    } else {
      // its display value is programmatically set to 'none'
      $(this).hide();
    }
  });
});
