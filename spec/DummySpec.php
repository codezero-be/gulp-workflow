<?php namespace spec\App;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class DummySpec extends ObjectBehavior {

    function it_is_initializable()
    {
        $this->shouldHaveType('App\Dummy');
    }

    function it_crashes_with_a_bang()
    {
        $this->crash()->shouldReturn('BANG!!');
    }

}