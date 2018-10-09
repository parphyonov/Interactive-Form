// Global variables

// This variable will store the total cost of the chosen activities
let totalCost = 0;
// This one will target a paragraph hardcoded into .activities section to display total cost to the user
const $totalP = $('.total');
// This event handler will hide total paragraph in case total is equal to zero, i.e. no activity is checked
$totalP.bind('DOMSubtreeModified', function() {
  if (totalCost === 0) {
    $(this).hide();
  } else {
    $(this).show();
  }
})


// Sets focus on the first input element
$('#name').attr('autofocus', true);


// Targets #other-title
const $otherTitle = $('#other-title');
// Hides #other-title from the view, so that it appears only when JS is disabled
$otherTitle.toggle();
// If user selects 'other' option, #other-title appears
$('#title').on('change', function() {
  console.log($(this).val());
  if ($(this).val() === 'other') {
    $otherTitle.show();
  // or else gets hidden again
  } else {
    $otherTitle.hide();
  }
})


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
    // into a part of the common hearts options text
    // I liked the algorithm below and it was the only way to keep it this consice, and working:)
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


// I was fighting so much with adding and removing attributes before discovered is(':disabled'),
// that I started implementing objects. When I got the thing, I decided to leave parts of it as is.
// This object points at a conflicting meeting by its index in $checkboxes I will declare later
const conflicts = {
  'js-frameworks': 3,
  'js-libs': 4,
  'express': 1,
  'node': 2
}

// We select all the checkboxes inside .activities
const $checkboxes = $('.activities input');
// If change in a checkbox state occurs...
$checkboxes.on('change', function() {
  // Getting handle of the name, we will use it in the object later, and for cost calculations as well
  const name = $(this).attr('name');
  // Standard cost
  let cost = 100;
  // But general conference is more expensive
  if (name === 'all') {
    cost = 200;
  }
  // The name of the variable might be confusing, but it made sense to me
  // As it will hold an index to en-able or dis-able a conflicting event
  let abler = undefined;
  // And if a event is conflicting with another, the 'abler' will get its index value
  if (name in conflicts) {
    abler = conflicts[name];
  }

  // If it did not remain undefined, then we will either disable or enable conflicting event,
  // depending on the state of the event we are aimed at visiting
  if ($(this).is(':checked')) {
    if (abler !== undefined) {
      $checkboxes.eq(abler).attr('disabled', true);
    }
    totalCost += cost;
    $totalP.text(`Total: ${totalCost}`);
  } else {
    if (abler !== undefined) {
      $checkboxes.eq(abler).removeAttr('disabled');
    }
    totalCost -= cost;
    $totalP.text(`Total: ${totalCost}`);
  }
});


// Targets payment select and corresponging payment sections
const $paymentMode = $('#payment');
const $creditCardDiv = $('#credit-card');
const $paypalDiv = $creditCardDiv.next();
const $bitcoinDiv = $paypalDiv.next();

$paypalDiv.hide();
$bitcoinDiv.hide();

$paymentMode.on('change', function() {
  const value = $(this).val();
  if (value === 'credit card') {
    $creditCardDiv.show();
    $paypalDiv.hide();
    $bitcoinDiv.hide();
  } else if (value === 'paypal') {
    $paypalDiv.show();
    $creditCardDiv.hide();
    $bitcoinDiv.hide();
  } else if (value === 'bitcoin') {
    $bitcoinDiv.show();
    $creditCardDiv.hide();
    $paypalDiv.hide();
  }
});


// Error messages handler
const presentError = ($target, option, pos, text) => {
  if (option === 'inputs') {
    $target.attr('placeholder', text).addClass('required');
    if (pos === 'name') {
      window.scrollTo(0, 0);
    } else if (pos === 'mail') {
      window.scrollTo(0, 350);
    } else if (pos === 'ccNum' || pos === 'zip' || pos === 'cvv') {
      window.scrollTo(0, 650);
    }
  } else if (option === 'activities') {
    $target.addClass('required');
    $target.children('legend').eq(0).text('At least one activity needs to be selected!');
    window.scrollTo(0, 600);
  } else {
    console.error('Error message cannot be provided due to misprovided values!');
  }
}

// Form Validation

// Binds event listener to form on submit
$('form').on('submit', () => {
  // email regular expression validator is taken from https://stackoverflow.com/questions/2507030/email-validation-using-jquery
  const validEmailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  const onlyNumbersRegex = /^[0-9]*$/;
  const $ccNum = $('#cc-num');
  const $zip = $('#zip');
  const $cvv = $('#cvv');
  // conditions to validate against
  const nameFieldNotEmpty = $('#name').val() !== '';
  const emailIsValid = validEmailRegex.test($('#mail').val());
  const emailIsEmpty = $('#mail').val() === '';
  let atLeast1Activity;
  const creditCardInfoProvided =
    // 'credit card' payment option is select4ed
    $paymentMode.val() === 'credit card'
    // the values of credit card number, zip and cvv codes are provided
    && $ccNum.val() !== ''
    && $zip.val() !== ''
    && $cvv.val() !== '';
  const ccNum = $ccNum.val();
  const creditCardProps =
    // credit card details are not empty
    creditCardInfoProvided
    // credit card number contains only numbers AND its length is greater or equal to 13 OR less or equal to 16
    && (onlyNumbersRegex.test(ccNum) && (ccNum.length >= 13 || ccNum.length <= 16))
    // zip code contains five characters AND they are numbers only
    && ($zip.val().length === 5 && onlyNumbersRegex.test($zip.val()))
    // cvv code contains three characters AND they are numbers only
    && ($cvv.val().length === 3 && onlyNumbersRegex.test($cvv.val()));

    const errorEmptyField = 'This field is required!';
    const errorInvalidCCNum = 'Wrong number of digits!';
    const errorInvalidCCSymbols = 'Invalid card number!';
    const errorInvalidZip = 'Invalid zip code!';
    const errorInvalidZipLength = 'Zips are 5 digits long!'
    const errorInvalidCVVLength = 'CVV is 3 digits!';
    const errorInvalidCVV = 'Invalid CVV!';

    // CCV errors-check on
    // no value provided
    if ($cvv.val() === '') {
      presentError($cvv, 'inputs', 'cvv', errorEmptyField);
    // non-digits provided
    } else if (!onlyNumbersRegex.test($cvv.val())) {
      presentError($cvv, 'inputs', 'cvv', errorInvalidCVV);
      $cvv.val('');
    // wrong length of CVV
    } else if ($cvv.val().length !== 3) {
      presentError($cvv, 'inputs', 'cvv', errorInvalidCVVLength);
      $cvv.val('');
    }

    // ZIP errors-check on
    // no value provided
    if ($zip.val() === '') {
      presentError($zip, 'inputs', 'zip', errorEmptyField);
    // non-digits provided
    } else if (!onlyNumbersRegex.test($zip.val())) {
      presentError($zip, 'inputs', 'zip', errorInvalidZip);
      $zip.val('');
    // wrong length of ZIP
    } else if ($zip.val().length !== 5) {
      presentError($zip, 'inputs', 'zip', errorInvalidZipLength);
      $zip.val('');
    }

    // Credit card number errors-check on
    // no value provided
    if (ccNum === '') {
      presentError($ccNum, 'inputs', 'ccNum', errorEmptyField);
    // non-digits provided
    } else if (!onlyNumbersRegex.test(ccNum)) {
      presentError($ccNum, 'inputs', 'ccNum', errorInvalidCCSymbols);
      $ccNum.val('');
    // wrong length of credit card number
    } else if (ccNum.length <= 13 || ccNum.length >= 16) {
      presentError($ccNum, 'inputs', 'ccNum', errorInvalidCCNum);
      $ccNum.val('');
    }

    if ($('.activities input:checked').length > 0) {
      atLeast1Activity = true;
    } else {
      presentError($('.activities'), 'activities')
    };
    if (emailIsEmpty) {
      presentError($('#mail'), 'inputs', 'mail', errorEmptyField);
    }
    if (!nameFieldNotEmpty) {
      presentError($('#name'), 'inputs', 'name', errorEmptyField);
    }



  // this conditional prevents the form from submission if not all information is provided
  if (nameFieldNotEmpty && emailIsValid && atLeast1Activity && creditCardProps) {
    return true;
  } else {
    // window.scrollTo(0, 0);
    return false;
  }
});
