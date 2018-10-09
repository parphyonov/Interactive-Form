// This script does not block form's performance - progressive enhancement is in place

// Global variables

// This variable will store the total cost of the chosen activities
let totalCost = 0;
// This one will target a paragraph hardcoded into .activities section to display total cost to the user
const $totalP = $('.total');
// This event handler will hide total paragraph in case total is equal to zero, i.e. no activity is checked
$totalP.bind('DOMSubtreeModified', () => {
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
$('#title').on('change', () => {
  console.log($(this).val());
  if ($(this).val() === 'other') {
    $otherTitle.show();
  // or else gets hidden again
  } else {
    $otherTitle.hide();
  }
})


// Whenever a user picks a different T-Shirt design the following logic will happen
$('#design').on('change', () => {
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
  $colors.each(() => {
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
$checkboxes.on('change', () => {
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

$paymentMode.on('change', () => {
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
  // Most validation error sources are inputs and they have different properties
  // to apply in contrast to .acrtivites section which is another branch
  // in this conditional block
  if (option === 'inputs') {
    // we add .required to $target that applies certain styles I wrote to make it look like a standard error
    $target.attr('placeholder', text).addClass('required');
    // Validation in the submit event listener below starts from the bottom of the page
    // This way if no validation errors are present at the top, the page will automatically scroll to the area where validation error occurs
    // But if there are validation errors at the top, the sequence will scroll the page to the top naturally
    if (pos === 'name') {
      window.scrollTo(0, 0);
    } else if (pos === 'mail') {
      window.scrollTo(0, 350);
    } else if (pos === 'ccNum' || pos === 'zip' || pos === 'cvv') {
      window.scrollTo(0, 650);
    }
  } else if (option === 'activities') {
    // Here we also add .required (that mostly affects the color of the text)
    $target.addClass('required');
    // And apply some styles to legend as well
    $target.children('legend').eq(0).text('At least one activity needs to be selected!');
    window.scrollTo(0, 600);
  } else {
    // If function is used in the wrong way, the console will print the error making it easy to locate it
    console.error('Error message cannot be provided due to misprovided values!');
  }
}

// Form Validation

// Binds event listener to form on submit
$('form').on('submit', () => {
  // email regular expression validator is taken from https://stackoverflow.com/questions/2507030/email-validation-using-jquery
  const validEmailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  // regular expression validator containing only numbers
  const onlyNumbersRegex = /^[0-9]*$/;
  // Targeting credit card section inputs
  const $ccNum = $('#cc-num');
  const $zip = $('#zip');
  const $cvv = $('#cvv');
  // conditions to validate against
  const nameFieldNotEmpty = $('#name').val() !== '';
  const emailIsValid = validEmailRegex.test($('#mail').val());
  const emailIsEmpty = $('#mail').val() === '';
  // We will assign a value for it later, when identifying validation errors
  let atLeast1Activity;
  const creditCardInfoProvided =
    // 'credit card' payment option is select4ed
    $paymentMode.val() === 'credit card'
    // the values of credit card number, zip and cvv codes are provided
    && $ccNum.val() !== ''
    && $zip.val() !== ''
    && $cvv.val() !== '';
  // Value of #cc-num
  const ccNum = $ccNum.val();
  // Validation of all credit card details at once
  const creditCardProps =
    // credit card details are not empty
    creditCardInfoProvided
    // credit card number contains only numbers AND its length is greater or equal to 13 OR less or equal to 16
    && (onlyNumbersRegex.test(ccNum) && (ccNum.length >= 13 || ccNum.length <= 16))
    // zip code contains five characters AND they are numbers only
    && ($zip.val().length === 5 && onlyNumbersRegex.test($zip.val()))
    // cvv code contains three characters AND they are numbers only
    && ($cvv.val().length === 3 && onlyNumbersRegex.test($cvv.val()));

    // Errors object with text messages for errors
    const errors = {
      errorEmptyField: 'This field is required!',
      errorInvalidCCNum: 'Wrong number of digits!',
      errorInvalidCCSymbols: 'Invalid card number!',
      errorInvalidZip: 'Invalid zip code!',
      errorInvalidZipLength: 'Zips are 5 digits long!',
      errorInvalidCVVLength: 'CVV is 3 digits!',
      errorInvalidCVV: 'Invalid CVV!'
    }

    // CCV errors-check on
    // no value provided
    if ($cvv.val() === '') {
      presentError($cvv, 'inputs', 'cvv', errors['errorEmptyField']);
    // non-digits provided
    } else if (!onlyNumbersRegex.test($cvv.val())) {
      presentError($cvv, 'inputs', 'cvv', errors['errorInvalidCVV']);
      $cvv.val('');
    // wrong length of CVV
    } else if ($cvv.val().length !== 3) {
      presentError($cvv, 'inputs', 'cvv', errors['errorInvalidCVVLength']);
      $cvv.val('');
    }

    // ZIP errors-check on
    // no value provided
    if ($zip.val() === '') {
      presentError($zip, 'inputs', 'zip', errors['errorEmptyField']);
    // non-digits provided
    } else if (!onlyNumbersRegex.test($zip.val())) {
      presentError($zip, 'inputs', 'zip', errors['errorInvalidZip']);
      $zip.val('');
    // wrong length of ZIP
    } else if ($zip.val().length !== 5) {
      presentError($zip, 'inputs', 'zip', errors['errorInvalidZipLength']);
      $zip.val('');
    }

    // Credit card number errors-check on
    // no value provided
    if (ccNum === '') {
      presentError($ccNum, 'inputs', 'ccNum', errors['errorEmptyField']);
    // non-digits provided
    } else if (!onlyNumbersRegex.test(ccNum)) {
      presentError($ccNum, 'inputs', 'ccNum', errors['errorInvalidCCSymbols']);
      $ccNum.val('');
    // wrong length of credit card number
    } else if (ccNum.length <= 13 || ccNum.length >= 16) {
      presentError($ccNum, 'inputs', 'ccNum', errors['errorInvalidCCNum']);
      $ccNum.val('');
    }

    // And this is assigning a value of atLeast1Activity variable
    // If at least one activity checked
    if ($('.activities input:checked').length > 0) {
      // it gets true
      atLeast1Activity = true;
    // else it gets false and error is displayed
    } else {
      presentError($('.activities'), 'activities');
      atLeast1Activity = false
    };

    //
    if (emailIsEmpty) {
      presentError($('#mail'), 'inputs', 'mail', errors['errorEmptyField']);
    }
    if (!nameFieldNotEmpty) {
      presentError($('#name'), 'inputs', 'name', errors['errorEmptyField']);
    }


  // THE MAJOR VALIDATION OF THE FORM ELEMENTS
  // this conditional prevents the form from submission if not all information is provided
  if (nameFieldNotEmpty && emailIsValid && atLeast1Activity && creditCardProps) {
    return true;
  } else {
    // This return statement stops the form from validation
    return false;
  }
});
